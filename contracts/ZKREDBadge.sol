// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Pin to v4.9.6 — avoids Counters removal and mcopy errors in v5
import "@openzeppelin/contracts@4.9.6/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts@4.9.6/access/Ownable.sol";

/**
 * @title IDailyCheckIn
 * @notice Minimal interface to read streak data from DailyCheckIn contract
 */
interface IDailyCheckIn {
    function users(address user)
        external view
        returns (uint256 lastCheckIn, uint256 streak, uint256 totalCheckIns);
}

/**
 * @title ZKREDBadge
 * @notice On-chain badge NFT for ZKRED on Ritual Testnet
 *
 * Badge IDs:
 *   0 = Beginner        — connect wallet first time        [verified on-chain: always eligible]
 *   1 = 10 TX Milestone — 10+ transactions on Ritual       [website check only — tx count not readable on-chain]
 *   2 = 50 TX Veteran   — 50+ transactions on Ritual       [website check only — tx count not readable on-chain]
 *   3 = Ritual Holder   — holds 5+ ETH on Ritual           [verified on-chain: balance check]
 *   4 = 30-Day Streak   — 30 consecutive daily check-ins   [verified on-chain: reads CheckIn contract]
 *   5 = X Connected     — linked Twitter/X account         [website check only]
 *   6 = Discord Linked  — linked Discord account           [website check only]
 */
contract ZKREDBadge is ERC721URIStorage, Ownable {

    uint256 private _tokenIdCounter;

    uint8   public constant TOTAL_BADGES     = 7;
    uint256 public constant POINTS_PER_BADGE = 10;

    IDailyCheckIn public checkInContract;

    // user => badgeId => claimed
    mapping(address => mapping(uint8 => bool)) public hasBadge;

    // user totals
    mapping(address => uint256) public totalPoints;
    mapping(address => uint256) public badgeCount;

    // tokenId => badgeId
    mapping(uint256 => uint8) public tokenBadgeId;

    // badgeId => IPFS/metadata URI
    mapping(uint8 => string) public badgeURIs;

    // ── Events ───────────────────────────────────────────────────
    event BadgeClaimed(
        address indexed user,
        uint8   indexed badgeId,
        uint256         tokenId,
        uint256         totalPoints
    );

    // ── Constructor ──────────────────────────────────────────────
    constructor(address _checkInContract) ERC721("ZKRED Badge", "ZKRED") {
        checkInContract = IDailyCheckIn(_checkInContract);
    }

    // ── Admin ────────────────────────────────────────────────────
    function setCheckInContract(address _checkInContract) external onlyOwner {
        checkInContract = IDailyCheckIn(_checkInContract);
    }

    function setBadgeURI(uint8 badgeId, string calldata uri)
        external onlyOwner
    {
        require(badgeId < TOTAL_BADGES, "Invalid badge ID");
        badgeURIs[badgeId] = uri;
    }

    function setBadgeURIsBatch(
        uint8[]  calldata ids,
        string[] calldata uris
    ) external onlyOwner {
        require(ids.length == uris.length, "Length mismatch");
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] < TOTAL_BADGES, "Invalid badge ID");
            badgeURIs[ids[i]] = uris[i];
        }
    }

    // ── On-chain Eligibility Check ───────────────────────────────
    /**
     * @notice Check if a user is eligible to claim a badge.
     *
     * Badges verified fully on-chain:
     *   0 - Beginner:      always eligible
     *   3 - Ritual Holder: msg.sender must hold >= 5 ETH at claim time
     *   4 - 30-Day Streak: streak >= 30 read from DailyCheckIn contract
     *
     * Badges verified by website only (tx count not readable on-chain):
     *   1 - 10 TX Milestone
     *   2 - 50 TX Veteran
     *   5 - X Connected
     *   6 - Discord Linked
     */
    function checkEligibility(address user, uint8 badgeId)
        public view
        returns (bool eligible, string memory reason)
    {
        if (hasBadge[user][badgeId]) {
            return (false, "Badge already claimed");
        }

        // Badge 0: Beginner — always eligible on first claim
        if (badgeId == 0) {
            return (true, "");
        }

        // Badge 1: 10 TX Milestone — tx count not readable on-chain, website verifies
        if (badgeId == 1) {
            return (true, "");
        }

        // Badge 2: 50 TX Veteran — tx count not readable on-chain, website verifies
        if (badgeId == 2) {
            return (true, "");
        }

        // Badge 3: Ritual Holder — must hold 5+ ETH at time of claim
        if (badgeId == 3) {
            if (user.balance >= 5 ether) return (true, "");
            return (false, "Need 5+ Ritual ETH in wallet");
        }

        // Badge 4: 30-Day Streak — streak must be >= 30 in CheckIn contract
        if (badgeId == 4) {
            (, uint256 streak, ) = checkInContract.users(user);
            if (streak >= 30) return (true, "");
            return (false, "Need 30-day consecutive streak");
        }

        // Badge 5: X Connected — website verifies, no on-chain restriction
        if (badgeId == 5) {
            return (true, "");
        }

        // Badge 6: Discord Linked — website verifies, no on-chain restriction
        if (badgeId == 6) {
            return (true, "");
        }

        return (false, "Invalid badge ID");
    }

    // ── Claim Badge ──────────────────────────────────────────────
    function claimBadge(uint8 badgeId) external {
        require(badgeId < TOTAL_BADGES, "Invalid badge ID");
        require(!hasBadge[msg.sender][badgeId], "Badge already claimed");

        (bool eligible, string memory reason) = checkEligibility(msg.sender, badgeId);
        require(eligible, reason);

        // Update state
        hasBadge[msg.sender][badgeId]  = true;
        badgeCount[msg.sender]        += 1;
        totalPoints[msg.sender]       += POINTS_PER_BADGE;

        // Mint NFT
        _tokenIdCounter += 1;
        uint256 tokenId = _tokenIdCounter;
        tokenBadgeId[tokenId] = badgeId;

        _safeMint(msg.sender, tokenId);

        if (bytes(badgeURIs[badgeId]).length > 0) {
            _setTokenURI(tokenId, badgeURIs[badgeId]);
        }

        emit BadgeClaimed(msg.sender, badgeId, tokenId, totalPoints[msg.sender]);
    }

    // ── Views ────────────────────────────────────────────────────
    function getUserBadges(address user)
        external view
        returns (bool[7] memory badges)
    {
        for (uint8 i = 0; i < TOTAL_BADGES; i++) {
            badges[i] = hasBadge[user][i];
        }
    }

    function getUserStats(address user)
        external view
        returns (
            uint256 points,
            uint256 badges,
            bool[7] memory earned
        )
    {
        points = totalPoints[user];
        badges = badgeCount[user];
        for (uint8 i = 0; i < TOTAL_BADGES; i++) {
            earned[i] = hasBadge[user][i];
        }
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
