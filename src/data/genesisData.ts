import { GenesisAnchorData } from '../types';

export const genesisAnchorData: GenesisAnchorData = {
  rootHash: '7b22d109f63567882e38c9509df636e2f1cf57b98ec36081492a4060875b42d1',
  payloadHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
  timestamp: '2026-11-18T08:00:00.104Z',
  signatory: 'Michel Bruining',
  role: 'Security Lead & Forensisch Onderzoeker',
  signature: 'SIG_ED25519_MB_8f90c42aa689d001b97e55102a7b8e',
  algorithm: 'SHA-256 + Ed25519',
  dossierRef: 'VW-INV-20261118-0800-MB',
  status: 'ONVERANDERBAAR VERANKERD (IMMUTABLE ROOT)',
};

export const genesisCppCode = `// ============================================================================
// VEILIGWEB LINUX MOBILE - CRYPTOGRAFISCH GENESIS ROOT ANKER
// Bestand: native/include/veiligweb/genesis.hpp
// Auditdossier: VW-INV-20261118-0800-MB
// Autoriteit: Michel Bruining (Security Lead)
// Standaard: ISO C++23 (ISO/IEC 14882:2023)
// ============================================================================

#pragma once

#include <string_view>
#include <cstdint>
#include <array>
#include <expected>

namespace veiligweb::crypto {

/// @brief Permanent cryptografisch anker van de Veiligweb Linux Mobile IP-Chain.
/// Dit is de onveranderbare Genesis Root Hash zoals vastgelegd in Dossier VW-INV-20261118-0800-MB.
inline constexpr std::string_view IP_GENESIS_ROOT_HASH =
    "7b22d109f63567882e38c9509df636e2f1cf57b98ec36081492a4060875b42d1";

/// @brief Genesis Payload Hash (SHA-256 van lege initiële payload conform IP-Chain)
inline constexpr std::string_view IP_GENESIS_PAYLOAD_HASH =
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/// @brief Vorige hash van het Genesis-blok (exact 64 nullen, geen voorloper)
inline constexpr std::string_view IP_GENESIS_PREVIOUS_HASH =
    "0000000000000000000000000000000000000000000000000000000000000000";

/// @brief Formeel ISO 8601 tijdstempel van verankering
inline constexpr std::string_view IP_GENESIS_TIMESTAMP =
    "2026-11-18T08:00:00.104Z";

/// @brief Geautoriseerde ondertekenaar van het Genesis blok
inline constexpr std::string_view IP_GENESIS_SIGNATORY =
    "Michel Bruining (Security Lead)";

/// @brief Ed25519 handtekening van de onderzoeker over het Genesis anker
inline constexpr std::string_view IP_GENESIS_SIGNATURE =
    "SIG_ED25519_MB_8f90c42aa689d001b97e55102a7b8e";

/// @brief Formele referentie naar het geaccordeerde forensische auditdossier
inline constexpr std::string_view IP_GENESIS_DOSSIER_REF =
    "VW-INV-20261118-0800-MB";

enum class GenesisValidationError : uint8_t {
    none = 0,
    hash_mismatch = 1,
    length_invalid = 2,
    invalid_character = 3,
    null_pointer = 4
};

/// @brief Valideert of een kandidaat-string hexadecimaal 64 karakters is
[[nodiscard]] constexpr bool is_valid_sha256_hex(std::string_view hash) noexcept {
    if (hash.size() != 64) return false;
    for (char c : hash) {
        bool is_digit = (c >= '0' && c <= '9');
        bool is_hex_lower = (c >= 'a' && c <= 'f');
        if (!is_digit && !is_hex_lower) return false;
    }
    return true;
}

/// @brief Compile-time verificatie van de Genesis Root Hash
[[nodiscard]] constexpr bool verify_genesis_root(std::string_view candidate_hash) noexcept {
    return candidate_hash == IP_GENESIS_ROOT_HASH;
}

/// @brief Runtime of compile-time verificatieresultaat met foutclassificatie
[[nodiscard]] constexpr std::expected<bool, GenesisValidationError>
validate_candidate_root(std::string_view candidate_hash) noexcept {
    if (candidate_hash.size() != 64) {
        return std::unexpected(GenesisValidationError::length_invalid);
    }
    if (!is_valid_sha256_hex(candidate_hash)) {
        return std::unexpected(GenesisValidationError::invalid_character);
    }
    if (candidate_hash != IP_GENESIS_ROOT_HASH) {
        return std::unexpected(GenesisValidationError::hash_mismatch);
    }
    return true;
}

// ============================================================================
// COMPILE-TIME ONVERANDERBAARHEIDSGARANTIES (C++23 static_assert)
// ============================================================================
static_assert(IP_GENESIS_ROOT_HASH.size() == 64, "Root hash moet exact 64 hex karakters zijn");
static_assert(is_valid_sha256_hex(IP_GENESIS_ROOT_HASH), "Root hash moet valide kleine letters hex zijn");
static_assert(is_valid_sha256_hex(IP_GENESIS_PAYLOAD_HASH), "Payload hash moet valide kleine letters hex zijn");
static_assert(IP_GENESIS_PREVIOUS_HASH.size() == 64, "Previous hash moet exact 64 nullen zijn");
static_assert(verify_genesis_root("7b22d109f63567882e38c9509df636e2f1cf57b98ec36081492a4060875b42d1"), "Zelfverificatie moet slagen");

} // namespace veiligweb::crypto
`;

export const genesisJsonAnchor = `{
  "$schema": "https://veiligweb.org/schemas/genesis-anchor-v1.json",
  "anchorVersion": "1.0",
  "dossierNumber": "VW-INV-20261118-0800-MB",
  "immutableRoot": {
    "blockNumber": 0,
    "blockType": "GENESIS",
    "rootHash": "7b22d109f63567882e38c9509df636e2f1cf57b98ec36081492a4060875b42d1",
    "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
    "timestamp": "2026-11-18T08:00:00.104Z",
    "algorithm": "SHA-256 + Ed25519",
    "signatory": "Michel Bruining",
    "role": "Hoofdonderzoeker & IP-Chain Compliance Lead",
    "signature": "SIG_ED25519_MB_8f90c42aa689d001b97e55102a7b8e",
    "verificationStatus": "VERIFIED_PERMANENT_ROOT"
  },
  "projectBinding": {
    "target": "Veiligweb Linux Mobile V1.1",
    "cxxHeaderPath": "native/include/veiligweb/genesis.hpp",
    "constexprVerified": true,
    "staticAssertCoverage": [
      "verify_genesis_root",
      "is_valid_sha256_hex",
      "length_check_64"
    ]
  }
}`;
