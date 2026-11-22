import { IntegrationTestSuite, PipelineJob, SecurityBoundaryItem } from '../types';

export const initialTestSuites: IntegrationTestSuite[] = [
  {
    id: 'suite-core-v1-1',
    name: 'C++23 Kern V1.1 Foutafhandeling & std::expected',
    module: 'core_v1_1',
    filePath: 'native/tests/test_core_v1_1.cpp::test_error_domain_and_types',
    description: 'Valideert typed error codes (100-299), non-throwing noexcept semantiek en std::expected waardetransformaties.',
    cases: [
      {
        id: 'tc-core-expected-semantics',
        name: 'std::expected Result<T> Waarde & Foutmechanisme',
        functionName: 'test_error_domain_and_types()',
        status: 'idle',
        durationMs: 1.1,
        description: 'Controleert of Result<T> correct switcht tussen payload en CoreError met domain "veiligweb.core.v1_1".',
        assertions: [
          { description: 'make_error() produceert correcte enum code en domeinnaam', passed: true, actual: 'veiligweb.core.v1_1', expected: 'veiligweb.core.v1_1' },
          { description: 'Result met std::unexpected retourneert has_value() == false', passed: true, actual: 'false', expected: 'false' },
          { description: 'Zero heap allocations tijdens foutgeneratie', passed: true, actual: '0 bytes', expected: '0 bytes' }
        ]
      },
      {
        id: 'tc-core-protocol-empty-validation',
        name: 'Validatie van Lege Protocol Invoer',
        functionName: 'find_protocol("") -> empty_protocol_name',
        status: 'idle',
        durationMs: 0.9,
        description: 'Verifieert dat lege invoer direct wordt geweigerd met CoreErrorCode::empty_protocol_name (103).',
        assertions: [
          { description: 'find_protocol("") faalt met code 103 (empty_protocol_name)', passed: true, actual: '103', expected: '103' },
          { description: 'Foutmelding is informatief en niet leeg', passed: true, actual: 'Niet leeg', expected: 'Niet leeg' }
        ]
      },
      {
        id: 'tc-core-protocol-legacy-block',
        name: 'Verboden Legacy Ciphers met Typed Foutcode',
        functionName: 'find_protocol("SSLv3") -> legacy_protocol_forbidden',
        status: 'idle',
        durationMs: 1.2,
        description: 'Zorgt dat SSLv2/SSLv3/TLS 1.0/TLS 1.1 deterministisch falen met CoreErrorCode::legacy_protocol_forbidden (102).',
        assertions: [
          { description: 'find_protocol("SSLv3") retourneert code 102', passed: true, actual: '102 (forbidden)', expected: '102' },
          { description: 'find_protocol("TLS 1.0") retourneert code 102', passed: true, actual: '102 (forbidden)', expected: '102' },
          { description: 'validate_protocol_compliance() wijst legacy af', passed: true, actual: 'Weigering', expected: 'Weigering' }
        ]
      },
      {
        id: 'tc-core-net-missing-iface',
        name: 'Netwerkinspectie Niet-bestaande Interface',
        functionName: 'get_interface_by_name("non_existent")',
        status: 'idle',
        durationMs: 1.6,
        description: 'Test dat het opvragen van onbekende interfaces faalt met CoreErrorCode::interface_not_found (202).',
        assertions: [
          { description: 'get_interface_by_name("missing") retourneert code 202', passed: true, actual: '202 (not_found)', expected: '202' },
          { description: 'Syscall getifaddrs() resources worden correct opgeruimd via RAII', passed: true, actual: 'RAII cleaned', expected: 'RAII cleaned' }
        ]
      }
    ]
  },
  {
    id: 'suite-protocol-registry',
    name: 'Protocol Registry Contract & Legacy Rejection',
    module: 'protocol_registry',
    filePath: 'native/tests/integration_tests.cpp::test_protocol_registry_contract',
    description: 'Valideert RFC-standaarden voor moderne transportprotocollen en handhaaft strikte blokkade van legacy SSL/TLS.',
    cases: [
      {
        id: 'tc-proto-catalog-bounds',
        name: 'Catalogus Invariant & Dimensie',
        functionName: 'test_catalog_size_and_bounds()',
        status: 'idle',
        durationMs: 1.4,
        description: 'Controleert of de protocolcatalogus minstens 10 items bevat en alle verplichte velden heeft ingevuld.',
        assertions: [
          { description: 'protocol_catalog() levert span met items > 0 op', passed: true, actual: '11 items', expected: '> 0' },
          { description: 'Elk item heeft een geldige laag (application, security, transport, etc.)', passed: true, actual: 'Valide', expected: 'Niet leeg' }
        ]
      },
      {
        id: 'tc-proto-rfc-conformance',
        name: 'HTTP & TLS RFC-Conformiteit',
        functionName: 'test_http_and_tls_rfc_mappings()',
        status: 'idle',
        durationMs: 2.1,
        description: 'Valideert formele RFC-koppelingen: HTTP/1.1 (RFC 9112), HTTP/2 (RFC 9113), HTTP/3 (RFC 9114), TLS 1.3 (RFC 8446).',
        assertions: [
          { description: 'HTTP/1.1 geregistreerd onder RFC 9112', passed: true, actual: 'RFC 9112', expected: 'RFC 9112' },
          { description: 'HTTP/2 geregistreerd onder RFC 9113', passed: true, actual: 'RFC 9113', expected: 'RFC 9113' },
          { description: 'HTTP/3 geregistreerd onder RFC 9114', passed: true, actual: 'RFC 9114', expected: 'RFC 9114' },
          { description: 'TLS 1.3 heeft status design_scope onder RFC 8446', passed: true, actual: 'design_scope', expected: 'design_scope' }
        ]
      },
      {
        id: 'tc-proto-normalization',
        name: 'Case-Insensitieve Normalisatie',
        functionName: 'test_protocol_name_normalization()',
        status: 'idle',
        durationMs: 1.8,
        description: 'Test of protocollen ongeacht hoofd-/kleine letters betrouwbaar worden gevonden via std::toupper normalisatie.',
        assertions: [
          { description: 'find_protocol("http/3") retourneert HTTP/3 record', passed: true, actual: 'HTTP/3', expected: 'HTTP/3' },
          { description: 'find_protocol("tls 1.3") retourneert TLS 1.3 record', passed: true, actual: 'TLS 1.3', expected: 'TLS 1.3' },
          { description: 'find_protocol("qUiC") retourneert QUIC record', passed: true, actual: 'QUIC', expected: 'QUIC' }
        ]
      },
      {
        id: 'tc-proto-legacy-rejection',
        name: 'Strikte Weigering Legacy Protocollen',
        functionName: 'test_legacy_ciphers_rejection()',
        status: 'idle',
        durationMs: 1.2,
        description: 'Blokkeert onveilige en verouderde protocollen (SSLv2, SSLv3, TLS 1.0, TLS 1.1) in overeenstemming met moderne security baselines.',
        assertions: [
          { description: 'is_forbidden_legacy("SSLv3") retourneert true', passed: true, actual: 'true', expected: 'true' },
          { description: 'is_forbidden_legacy("TLS 1.0") retourneert true', passed: true, actual: 'true', expected: 'true' },
          { description: 'is_forbidden_legacy("TLS 1.1") retourneert true', passed: true, actual: 'true', expected: 'true' },
          { description: 'is_forbidden_legacy("TLS 1.3") retourneert false (toegestaan)', passed: true, actual: 'false', expected: 'false' }
        ]
      },
      {
        id: 'tc-proto-pqc-readiness',
        name: 'Post-Quantum NIST Standaarden (FIPS 203 & 204)',
        functionName: 'test_post_quantum_catalog_entries()',
        status: 'idle',
        durationMs: 1.5,
        description: 'Verifieert aanwezigheid van post-quantum sleutelovereenkomst (ML-KEM) en handtekeningen (ML-DSA).',
        assertions: [
          { description: 'ML-KEM geregistreerd met referentie NIST FIPS 203', passed: true, actual: 'NIST FIPS 203', expected: 'NIST FIPS 203' },
          { description: 'ML-DSA geregistreerd met referentie NIST FIPS 204', passed: true, actual: 'NIST FIPS 204', expected: 'NIST FIPS 204' }
        ]
      }
    ]
  },
  {
    id: 'suite-network-inspector',
    name: 'Linux Mobile Network Inspector & System Bounds',
    module: 'network_inspector',
    filePath: 'native/tests/integration_tests.cpp::test_network_inspector_contract',
    description: 'Valideert passieve getifaddrs() inspectie, interface vlaggen en waarborgt dat geen netwerkconfiguraties worden gewijzigd.',
    cases: [
      {
        id: 'tc-net-enumeration',
        name: 'Interface Enumeratie & Buffer Bounds',
        functionName: 'test_network_interface_enumeration()',
        status: 'idle',
        durationMs: 3.4,
        description: 'Controleert of getifaddrs() interfaces veilig uitleest binnen de Linux IFNAMSIZ (16 tekens) bufferlimiet.',
        assertions: [
          { description: 'Alle interface-namen zijn niet-leeg', passed: true, actual: 'Niet-leeg', expected: 'Niet-leeg' },
          { description: 'Lengte van elke interface-naam <= 16 bytes', passed: true, actual: '<= 16 chars', expected: '<= 16 chars' },
          { description: 'Unieke interfaces zonder duplicaten geretourneerd', passed: true, actual: 'Deduplicated', expected: 'Geen dubbelen' }
        ]
      },
      {
        id: 'tc-net-loopback-detection',
        name: 'Loopback Vlag & Status Detectie',
        functionName: 'test_loopback_and_up_flags()',
        status: 'idle',
        durationMs: 2.8,
        description: 'Test of IFF_LOOPBACK en IFF_UP vlaggen correct worden geëxtraheerd uit ifa_flags.',
        assertions: [
          { description: 'Interface "lo" heeft loopback = true', passed: true, actual: 'true', expected: 'true' },
          { description: 'Interface state up/down weerspiegelt IFF_UP bitmask', passed: true, actual: 'IFF_UP parsed', expected: 'Bitwise parsed' }
        ]
      },
      {
        id: 'tc-net-memory-cleanup',
        name: 'Geheugenbeheer & freeifaddrs Valideren',
        functionName: 'test_memory_cleanup_and_idempotence()',
        status: 'idle',
        durationMs: 4.2,
        description: 'Voert 10 opeenvolgende list_network_interfaces() aanroepen uit en verifieert afwezigheid van geheugenlekken.',
        assertions: [
          { description: '10 opeenvolgende aanroepen leveren consistente interface-aantallen', passed: true, actual: 'Identiek', expected: 'Identiek' },
          { description: 'std::unique_ptr custom deleter roept freeifaddrs() correct aan', passed: true, actual: 'Geen leaks', expected: 'Zero leak' }
        ]
      },
      {
        id: 'tc-net-readonly-integrity',
        name: 'Passieve Read-Only Beveiligingswaarborg',
        functionName: 'test_readonly_security_invariant()',
        status: 'idle',
        durationMs: 1.9,
        description: 'Verifieert dat de inspectiemodule geen SIOCSIFADDR of ioctl mutaties uitvoert.',
        assertions: [
          { description: 'Geen sockets geopend met mutatiepermissies', passed: true, actual: 'Read-only', expected: 'Read-only' },
          { description: 'Geen root/CAP_NET_ADMIN privileges vereist', passed: true, actual: 'Non-root', expected: 'Non-root' }
        ]
      }
    ]
  },
  {
    id: 'suite-jni-bridge',
    name: 'Android JNI Bridge & Memory Contract',
    module: 'jni_bridge',
    filePath: 'native/tests/integration_tests.cpp::test_jni_status_string_contract',
    description: 'Valideert het status-tekst contract, JNIEnv string marshalling en Android logcat export.',
    cases: [
      {
        id: 'tc-jni-status-signature',
        name: 'JNI Export Symbool & Naamgevingsconventie',
        functionName: 'test_jni_symbol_export_contract()',
        status: 'idle',
        durationMs: 2.5,
        description: 'Controleert of Java_org_veiligweb_mobile_MainActivity_nativeStatus exact overeenkomt met de Java native-declaratie.',
        assertions: [
          { description: 'Symbool Java_org_veiligweb_mobile_MainActivity_nativeStatus geëxporteerd met C linkage', passed: true, actual: 'Found in .dynsym', expected: 'Exported' },
          { description: 'Retourtype is jstring, parameters zijn (JNIEnv*, jobject)', passed: true, actual: 'jstring (JNIEnv*, jobject)', expected: 'Correcte signatuur' }
        ]
      },
      {
        id: 'tc-jni-output-format',
        name: 'Status Output Structuur & Headers',
        functionName: 'test_native_status_string_structure()',
        status: 'idle',
        durationMs: 2.9,
        description: 'Valideert of de gegenereerde tekst de verplichte Veiligweb headers, protocollen en interfaces bevat.',
        assertions: [
          { description: 'Bevat "VEILIGWEB LINUX MOBILE" header', passed: true, actual: 'Aanwezig', expected: 'Aanwezig' },
          { description: 'Bevat protocolcatalogus regels met [layer] formaat', passed: true, actual: '11 regels', expected: '>= 10 regels' },
          { description: 'Bevat netwerkinterfaces sectie met UP/DOWN indicatie', passed: true, actual: 'Aanwezig', expected: 'Aanwezig' }
        ]
      },
      {
        id: 'tc-jni-buffer-limit',
        name: 'String Bounds & UTF-8 Veiligheid',
        functionName: 'test_string_bounds_and_utf8()',
        status: 'idle',
        durationMs: 1.7,
        description: 'Waarborgt dat NewStringUTF() uitsluitend geldige UTF-8 bytes ontvangt binnen de maximale payloadgrens.',
        assertions: [
          { description: 'Gegenereerde statusstring < 65.536 bytes (veilige JNI overdracht)', passed: true, actual: '1.240 bytes', expected: '< 65536' },
          { description: 'Geldige UTF-8 encoding zonder ongevalideerde bytes', passed: true, actual: 'Valid UTF-8', expected: 'Valid UTF-8' }
        ]
      }
    ]
  },
  {
    id: 'suite-security-boundaries',
    name: 'Android Sandbox & Security Boundary Audit',
    module: 'security_core',
    filePath: 'native/tests/integration_tests.cpp::test_security_boundaries_policy',
    description: 'Bewaakt OS-privilege scheiding, verbod op ongeoorloofde kernelwijzigingen en formaliseert VpnService vereiste.',
    cases: [
      {
        id: 'tc-sec-no-root',
        name: 'Non-Root Invariant & Linux UID Scheiding',
        functionName: 'test_no_root_requirement()',
        status: 'idle',
        durationMs: 1.3,
        description: 'Valideert dat de applicatie functioneert in standaard Android app UID (zonder su of root escalatie).',
        assertions: [
          { description: 'Applicatie verzoekt geen root rechten (su/superuser)', passed: true, actual: 'UID >= 10000', expected: 'Unprivileged' },
          { description: 'Geen aanroepen naar system() of exec() met root binaire paden', passed: true, actual: 'Schoon', expected: 'Geen root calls' }
        ]
      },
      {
        id: 'tc-sec-vpnservice-boundary',
        name: 'Android VpnService Beveiligingsgrens',
        functionName: 'test_vpn_service_enforcement()',
        status: 'idle',
        durationMs: 1.6,
        description: 'Formaliseert dat tunneling uitsluitend mag plaatsvinden na expliciete gebruikerstoestemming via android.net.VpnService.',
        assertions: [
          { description: 'V1.1 bevat geen ongeautoriseerde socket tunneling', passed: true, actual: 'Strict read-only', expected: 'Geen bypass' },
          { description: 'Tunneling vereist expliciete VpnService intent in V2.0', passed: true, actual: 'VpnService voorbereid', expected: 'User consent' }
        ]
      },
      {
        id: 'tc-sec-keystore-isolation',
        name: 'Hardware-backed Keystore Afbakening',
        functionName: 'test_keystore_hardware_boundary()',
        status: 'idle',
        durationMs: 1.8,
        description: 'Waarborgt dat cryptografische sleutels in toekomstige versies worden opgeslagen in Android Keystore / TEE (Secure Enclave).',
        assertions: [
          { description: 'Geen platte sleutelopslag op bestandsysteem', passed: true, actual: 'Geen plaintext keys', expected: 'Geen plaintext keys' },
          { description: 'RubyKey / Keystore integratieschema gevalideerd', passed: true, actual: 'Conform roadmap', expected: 'Hardware TEE' }
        ]
      }
    ]
  }
];

export const initialPipelineJobs: PipelineJob[] = [
  {
    id: 'job-format-lint',
    name: 'C++23 Stijl & Linting',
    runner: 'ubuntu-24.04',
    category: 'host',
    status: 'idle',
    steps: [
      {
        id: 'step-clang-format',
        name: 'clang-format-18 validatie',
        command: 'clang-format-18 --dry-run --Werror native/include/**/*.hpp native/src/**/*.cpp',
        status: 'idle',
        logs: [
          'Checking C++23 source file formatting against Google style guide...',
          'native/include/veiligweb/error.hpp: OK',
          'native/include/veiligweb/protocol_registry.hpp: OK',
          'native/include/veiligweb/network_inspector.hpp: OK',
          'native/src/protocol_registry.cpp: OK',
          'native/src/network_inspector.cpp: OK',
          'native/src/jni_bridge.cpp: OK',
          'clang-format: All 6 files formatted conforming to standards.'
        ]
      },
      {
        id: 'step-clang-tidy',
        name: 'clang-tidy C++23 modern checks',
        command: 'clang-tidy -p build-host native/src/*.cpp -- -std=c++23',
        status: 'idle',
        logs: [
          'Analyzing AST for modernize-use-starts-ends-with, modernize-use-std-span, std::expected...',
          'No warnings reported. C++23 std::expected and std::span usage conforms.'
        ]
      }
    ]
  },
  {
    id: 'job-host-tests',
    name: 'Host C++23 Unit & Integratietests (CTest)',
    runner: 'ubuntu-24.04 (GCC-14 & Clang-18)',
    category: 'host',
    status: 'idle',
    dependsOn: ['job-format-lint'],
    steps: [
      {
        id: 'step-cmake-config',
        name: 'CMake 3.22 configuratie (C++23 & CTest)',
        command: 'cmake -B build-host -G Ninja -DCMAKE_BUILD_TYPE=Release -DVEILIGWEB_BUILD_TESTS=ON -DVEILIGWEB_BUILD_INTEGRATION_TESTS=ON -DCMAKE_CXX_STANDARD=23',
        status: 'idle',
        logs: [
          '-- The CXX compiler identification is GNU 14.2.0',
          '-- Detecting CXX compiler ABI info - done',
          '-- Check for working CXX compiler: /usr/bin/g++-14 - skipped',
          '-- Setting C++ standard to C++23 (REQUIRED)',
          '-- Configuring done (0.28s)',
          '-- Generating done (0.04s)',
          '-- Build files written to: build-host'
        ]
      },
      {
        id: 'step-cmake-build',
        name: 'Compilatie native test executables',
        command: 'cmake --build build-host --target veiligweb_tests veiligweb_core_v1_1_tests veiligweb_integration_tests',
        status: 'idle',
        logs: [
          '[1/5] Building CXX object CMakeFiles/veiligweb_core.dir/native/src/protocol_registry.cpp.o',
          '[2/5] Building CXX object CMakeFiles/veiligweb_core.dir/native/src/network_inspector.cpp.o',
          '[3/5] Linking CXX static library libveiligweb_core.a',
          '[4/5] Linking CXX executable veiligweb_core_v1_1_tests',
          '[5/5] Linking CXX executable veiligweb_integration_tests',
          'Build complete: 0 warnings, 0 errors.'
        ]
      },
      {
        id: 'step-ctest-run',
        name: 'CTest geautomatiseerde integratiesuite',
        command: 'ctest --test-dir build-host --output-on-failure --parallel 4',
        status: 'idle',
        logs: [
          'Test project /workspace/VeiligwebLinuxMobile/build-host',
          '    Start 1: veiligweb_unit_tests',
          '    Start 2: veiligweb_core_v1_1_tests',
          '    Start 3: veiligweb_integration_tests',
          '1/3 Test #1: veiligweb_unit_tests ...................   Passed   0.02 sec',
          '2/3 Test #2: veiligweb_core_v1_1_tests ..............   Passed   0.03 sec',
          '3/3 Test #3: veiligweb_integration_tests ............   Passed   0.04 sec',
          '100% tests passed, 0 tests failed out of 3',
          'Total Test time (real) =   0.09 sec'
        ]
      }
    ]
  },
  {
    id: 'job-android-ndk',
    name: 'Android NDK Cross-Compile Matrix (ARM64 / x86_64)',
    runner: 'ubuntu-24.04 (NDK r27b)',
    category: 'android',
    status: 'idle',
    dependsOn: ['job-host-tests'],
    steps: [
      {
        id: 'step-ndk-arm64',
        name: 'Cross-compile arm64-v8a (Release)',
        command: 'cmake -S . -B build-arm64 -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake -DANDROID_ABI=arm64-v8a -DANDROID_PLATFORM=android-26',
        status: 'idle',
        logs: [
          'Target: aarch64-linux-android26',
          'Building shared library: libveiligweb_mobile.so [arm64-v8a]',
          'C++23 std::expected and hardening flags active (-fstack-protector-strong, -D_FORTIFY_SOURCE=2)',
          'Binary size: 146.2 KB'
        ]
      },
      {
        id: 'step-ndk-x86_64',
        name: 'Cross-compile x86_64 (Emulator)',
        command: 'cmake -S . -B build-x86_64 -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake -DANDROID_ABI=x86_64 -DANDROID_PLATFORM=android-26',
        status: 'idle',
        logs: [
          'Target: x86_64-linux-android26',
          'Building shared library: libveiligweb_mobile.so [x86_64]',
          'Binary size: 172.1 KB'
        ]
      }
    ]
  },
  {
    id: 'job-jni-audit',
    name: 'JNI Symbool & Sandbox Audit',
    runner: 'ubuntu-24.04',
    category: 'audit',
    status: 'idle',
    dependsOn: ['job-android-ndk'],
    steps: [
      {
        id: 'step-nm-symbols',
        name: 'Inspectie geëxporteerde JNI symbolen',
        command: 'nm -D build-arm64/libveiligweb_mobile.so | grep Java_org_veiligweb',
        status: 'idle',
        logs: [
          '00000000000028a0 T Java_org_veiligweb_mobile_MainActivity_nativeStatus',
          'Symbol signature matches JNI specification.',
          'No unexpected public symbols leaked in dynamic symbol table.'
        ]
      },
      {
        id: 'step-sec-boundary-check',
        name: 'Security Boundary & Syscall Audit',
        command: 'objdump -d build-arm64/libveiligweb_mobile.so | grep -E "system|execve|setuid"',
        status: 'idle',
        logs: [
          'Auditing for forbidden privileged syscalls...',
          'No banned execution symbols found.',
          'Strict user-space read-only compliance verified.'
        ]
      }
    ]
  },
  {
    id: 'job-package-apk',
    name: 'Gradle Assemble & APK Archiver',
    runner: 'ubuntu-24.04 (JDK 17)',
    category: 'package',
    status: 'idle',
    dependsOn: ['job-jni-audit'],
    steps: [
      {
        id: 'step-gradle-assemble',
        name: 'Gradle assembleDebug',
        command: './gradlew assembleDebug --stacktrace',
        status: 'idle',
        logs: [
          ':app:preBuild UP-TO-DATE',
          ':app:compileDebugAidl NO-SOURCE',
          ':app:compileDebugRenderscript NO-SOURCE',
          ':app:generateDebugBuildConfig UP-TO-DATE',
          ':app:buildCMakeDebug[arm64-v8a]',
          ':app:buildCMakeDebug[x86_64]',
          ':app:compileDebugJavaWithJavac',
          ':app:packageDebug',
          'BUILD SUCCESSFUL in 8s',
          'Generated: app/build/outputs/apk/debug/app-debug.apk'
        ]
      },
      {
        id: 'step-apk-verify',
        name: 'APK manifest & archivering',
        command: 'aapt dump badging app/build/outputs/apk/debug/app-debug.apk | grep package',
        status: 'idle',
        logs: [
          "package: name='org.veiligweb.mobile' versionCode='1' versionName='1.1.0'",
          'Permissions: android.permission.INTERNET',
          'Native libraries included: arm64-v8a, armeabi-v7a, x86_64',
          'Artifact successfully ready for deployment or sideloading.'
        ]
      }
    ]
  }
];

export const securityBoundaryItems: SecurityBoundaryItem[] = [
  {
    id: 'sec-cpp23-core',
    module: 'Native C++23 basis V1.1',
    statusV1: 'Geïmplementeerd',
    isolationType: 'User-space read-only',
    description: 'Moderne memory-safe datastructuren (std::expected, std::span, std::string_view, constexpr arrays, typed error codes 100-299).',
    boundaryRule: 'Geen raw pointers buiten veilige wrapper lifetimes; zero heap allocation op foutpaden.',
    verifiedInCI: true
  },
  {
    id: 'sec-jni-bridge',
    module: 'Android JNI Bridge V1.1',
    statusV1: 'Geïmplementeerd',
    isolationType: 'JNI ABI sandbox',
    description: 'Geëxporteerde nativeStatus interface met veilige string conversie, foutafhandeling en typeveiligheid naar Java/Kotlin.',
    boundaryRule: 'Beperkt tot expliciet geëxporteerd symbool; geen reflectie of dynamische injectie.',
    verifiedInCI: true
  },
  {
    id: 'sec-net-inspector',
    module: 'Netwerkinterfaces inspecteren V1.1',
    statusV1: 'Geïmplementeerd',
    isolationType: 'User-space read-only',
    description: 'Leest interfaces via getifaddrs() en netlink socket metadata met gestructureerde IPv4/IPv6 en MTU parsing.',
    boundaryRule: 'Strict read-only: geen sockets met mutatie-rechten (geen SIOCSIFADDR of ioctl writes).',
    verifiedInCI: true
  },
  {
    id: 'sec-proto-registry',
    module: 'Protocolregister & Legacy Filter V1.1',
    statusV1: 'Geïmplementeerd',
    isolationType: 'RFC / NIST standaard',
    description: 'Catalogus van moderne protocollen (HTTP/3, TLS 1.3, QUIC, PQC ML-KEM/DSA) met Result<Protocol> en actieve blokkade van SSLv2, SSLv3, TLS 1.0, TLS 1.1.',
    boundaryRule: 'Onveilige protocollen worden hard geweigerd met CoreErrorCode::legacy_protocol_forbidden (102).',
    verifiedInCI: true
  },
  {
    id: 'sec-unit-integration-tests',
    module: 'Native Unit- & Integratietests V1.1',
    statusV1: 'Geïmplementeerd',
    isolationType: 'User-space read-only',
    description: 'CTest test suites (veiligweb_core_v1_1_tests en veiligweb_integration_tests) die draaien in zowel host Linux als NDK.',
    boundaryRule: '100% assertions moeten slagen vóór APK assemblage in de CI pipeline.',
    verifiedInCI: true
  },
  {
    id: 'sec-tls-conn',
    module: 'TLS 1.3 Verbindingen',
    statusV1: 'Gepland V2.0',
    isolationType: 'RFC / NIST standaard',
    description: 'Native TLS 1.3 handshakes met moderne cipher suites en certificate pinning (nog afzonderlijk te bouwen).',
    boundaryRule: 'Uitsluitend veilige AEAD ciphers (AES-GCM / CHACHA20-POLY1305).',
    verifiedInCI: false
  },
  {
    id: 'sec-vpn-service',
    module: 'Android VPN Service (VpnService)',
    statusV1: 'Nog niet geïmplementeerd',
    isolationType: 'Android VpnService vereist',
    description: 'Routing van netwerkverkeer via Androids officiële VpnService API met TUN interface (nog afzonderlijk te bouwen).',
    boundaryRule: 'Android vereist expliciete gebruikerstoestemming; mag NOOIT via directe kernel/iptables root omzeild worden.',
    verifiedInCI: false
  },
  {
    id: 'sec-keystore',
    module: 'Android Keystore / RubyKey',
    statusV1: 'Nog niet geïmplementeerd',
    isolationType: 'Android Keystore / TEE',
    description: 'Hardware-backed sleutelopslag binnen de Android Secure Enclave / TrustZone (nog afzonderlijk te bouwen).',
    boundaryRule: 'Private keys verlaten nooit de hardware security module (StrongBox / TEE).',
    verifiedInCI: false
  },
  {
    id: 'sec-pqc',
    module: 'PQC-hybride Verbindingen',
    statusV1: 'In ontwerpfase',
    isolationType: 'RFC / NIST standaard',
    description: 'Hybride klassieke (X25519) + post-quantum (ML-KEM-768) sleuteluitwisseling volgens NIST FIPS 203 (nog afzonderlijk te bouwen).',
    boundaryRule: 'Beschermt tegen toekomstige "harvest now, decrypt later" aanvallen.',
    verifiedInCI: false
  },
  {
    id: 'sec-ip-chain',
    module: 'IP-Chain Auditregistratie',
    statusV1: 'Nog niet geïmplementeerd',
    isolationType: 'User-space read-only',
    description: 'Cryptografisch ondertekende audit logs van alle netwerk- en beveiligingsgebeurtenissen (nog afzonderlijk te bouwen).',
    boundaryRule: 'Wijzigingen in beleid vereisen menselijke goedkeuring en onweerlegbare logverankering.',
    verifiedInCI: false
  }
];
