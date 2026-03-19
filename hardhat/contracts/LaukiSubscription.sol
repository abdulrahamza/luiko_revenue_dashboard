// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LaukiSubscription
 * @notice On-chain subscription management for lauki.ai
 * @dev Deployed on Base Sepolia testnet. Users pay ETH to subscribe.
 */
contract LaukiSubscription {
    // ─── State ───────────────────────────────────────────────────────

    address public owner;
    uint256 public subscriptionPrice;   // wei
    uint256 public subscriptionDuration; // seconds

    // subscriber → expiry timestamp
    mapping(address => uint256) private _expiry;

    // ─── Events ──────────────────────────────────────────────────────

    event Subscribed(address indexed subscriber, uint256 expiry);
    event Cancelled(address indexed subscriber);
    event Withdrawn(address indexed to, uint256 amount);
    event PriceUpdated(uint256 newPrice);
    event DurationUpdated(uint256 newDuration);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ─── Errors ──────────────────────────────────────────────────────

    error NotOwner();
    error InsufficientPayment();
    error NoActiveSubscription();
    error WithdrawFailed();
    error ZeroAddress();

    // ─── Reentrancy Guard ────────────────────────────────────────────

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "ReentrancyGuard: reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────

    /**
     * @param _price Subscription price in wei
     * @param _duration Subscription duration in seconds
     */
    constructor(uint256 _price, uint256 _duration) {
        owner = msg.sender;
        subscriptionPrice = _price;
        subscriptionDuration = _duration;
    }

    // ─── User Functions ──────────────────────────────────────────────

    /**
     * @notice Subscribe by sending the exact subscription price in ETH.
     *         If already subscribed, extends from current expiry.
     */
    function subscribe() external payable nonReentrant {
        if (msg.value < subscriptionPrice) revert InsufficientPayment();

        uint256 currentExpiry = _expiry[msg.sender];
        uint256 startTime = block.timestamp > currentExpiry
            ? block.timestamp
            : currentExpiry;

        uint256 newExpiry = startTime + subscriptionDuration;
        _expiry[msg.sender] = newExpiry;

        // Refund excess payment
        uint256 excess = msg.value - subscriptionPrice;
        if (excess > 0) {
            (bool ok, ) = payable(msg.sender).call{value: excess}("");
            require(ok, "Refund failed");
        }

        emit Subscribed(msg.sender, newExpiry);
    }

    /**
     * @notice Cancel your active subscription. No refund is issued.
     */
    function cancelSubscription() external {
        if (_expiry[msg.sender] <= block.timestamp) revert NoActiveSubscription();
        _expiry[msg.sender] = block.timestamp; // expire immediately
        emit Cancelled(msg.sender);
    }

    // ─── View Functions ──────────────────────────────────────────────

    /**
     * @notice Check if an address has an active subscription.
     */
    function isSubscribed(address _addr) external view returns (bool) {
        return _expiry[_addr] > block.timestamp;
    }

    /**
     * @notice Get the exact expiry timestamp for a subscriber.
     */
    function getExpiry(address _addr) external view returns (uint256) {
        return _expiry[_addr];
    }

    // ─── Owner Functions ─────────────────────────────────────────────

    /**
     * @notice Withdraw contract balance to owner.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool ok, ) = payable(owner).call{value: balance}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(owner, balance);
    }

    /**
     * @notice Update subscription price (only affects new subscriptions).
     */
    function setPrice(uint256 _price) external onlyOwner {
        subscriptionPrice = _price;
        emit PriceUpdated(_price);
    }

    /**
     * @notice Update subscription duration (only affects new subscriptions).
     */
    function setDuration(uint256 _duration) external onlyOwner {
        subscriptionDuration = _duration;
        emit DurationUpdated(_duration);
    }

    /**
     * @notice Transfer ownership of the contract.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    /**
     * @notice Allow contract to receive ETH directly.
     */
    receive() external payable {}
}
