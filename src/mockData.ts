import { ExcelData } from "./types";

export const mockExcelData: ExcelData = {
  fileName: "sample_system_registry_2026.xlsx",
  fileSize: 45280, // ~45 KB
  sheets: [
    {
      name: "API & System Configs",
      headers: [
        "Config Key",
        "Value / Connection String",
        "Variable Type",
        "Security Class",
        "Deployment Node",
        "Description"
      ],
      rows: [
        [
          "AUTH_GATEWAY_URL",
          "https://auth.internal-net.io/v3/oauth/token",
          "String (URL)",
          "Tier-1 Critical",
          "node-auth-prod-01",
          "Primary OAuth token generation endpoint for distributed microservices."
        ],
        [
          "DB_READ_REPLICA_CONN",
          "postgresql://sys_replica_user:aK9#dH2!mP9@sql-replica-west.cloud.db/prod",
          "Secret URL",
          "Tier-1 Critical",
          "node-db-west-04",
          "Read-only replica for high-volume read operations and background jobs."
        ],
        [
          "STRI_PUBLIC_LIVE_KEY",
          "pk_live_51Ny8c2Ld0bX6w2PqZp0R7sE8aY2mW3vX8nQ9xZ2yT5...",
          "API Public Key",
          "Tier-2 Sensitive",
          "node-billing-02",
          "Stripe live environment public key used in client headers."
        ],
        [
          "GEO_IP_LOOKUP_TOKEN",
          "geo_token_982e_fba8832a884d0b1129",
          "Auth Token",
          "Tier-2 Sensitive",
          "node-edge-global",
          "MaxMind GeoIP database decryption and lookup authentication token."
        ],
        [
          "MAX_RETRY_ATTEMPTS",
          "5",
          "Integer",
          "Tier-3 Internal",
          "node-core-queue",
          "Maximum number of task execution retry attempts before message dead-lettering."
        ],
        [
          "CORS_ALLOWED_ORIGINS",
          "https://*.aistudio.build,https://*.run.app,https://localhost:3000",
          "Comma-separated list",
          "Tier-2 Sensitive",
          "node-edge-gateway",
          "Allowed origins whitelist for browser-based resource sharing permissions."
        ],
        [
          "JWT_SESSION_EXPIRY",
          "86400",
          "Integer (Seconds)",
          "Tier-3 Internal",
          "node-auth-prod-01",
          "Token longevity for secure sessions (equivalent to 24 hours)."
        ],
        [
          "SYS_RECOVERY_EMAIL",
          "security-alerts@enterprise-registry.net",
          "Email",
          "Tier-3 Internal",
          "node-alert-manager",
          "Inbox destination for elevated system alerts, core crashes, and memory leaks."
        ],
        [
          "AMQP_EVENT_BUS_URI",
          "amqps://rabbit-mq-cluster-prod-92.rmq.cloud.io:5671",
          "Connection URI",
          "Tier-1 Critical",
          "node-event-broker",
          "Primary message broker pipeline for event-driven pub-sub routing."
        ],
        [
          "REDIS_CACHE_TTL_DEFAULT",
          "3600",
          "Integer (Seconds)",
          "Tier-3 Internal",
          "node-cache-edge",
          "Fallback cache lifespan (1 hour) for standard localized API responses."
        ],
        [
          "AI_MODEL_BACKEND_ALIAS",
          "gemini-2.5-pro-experimental",
          "String (Model ID)",
          "Tier-3 Internal",
          "node-ai-orchestration",
          "Default model selector for cognitive orchestration tasks and summarization."
        ]
      ]
    },
    {
      name: "Inventory SKU Catalog",
      headers: [
        "SKU Identifier",
        "Product Nomenclature",
        "Storage Bin Location",
        "Serial Hex Registry",
        "Pricing Code",
        "Stock Status"
      ],
      rows: [
        [
          "SKU-MEM-32GB-DDR5",
          "HyperX Fury 32GB DDR5 6000MHz Dual Kit",
          "BIN-A12-R4",
          "0x8F2C4E9A701D",
          "PRC-A-VAL",
          "In Stock (142)"
        ],
        [
          "SKU-GPU-RTX4080S",
          "NVIDIA GeForce RTX 4080 Super Founders Edition",
          "BIN-B03-R2",
          "0x3A8E2C1B9D5F",
          "PRC-S-LUX",
          "Low Stock (12)"
        ],
        [
          "SKU-SSD-2TB-NVME",
          "Samsung 990 Pro 2TB M.2 PCIe Gen4 NVMe SSD",
          "BIN-A15-R1",
          "0x7C9E3B1D5F8A",
          "PRC-B-VAL",
          "In Stock (84)"
        ],
        [
          "SKU-CPU-I9-14900K",
          "Intel Core i9-14900K 24-Core 3.2GHz Desktop Processor",
          "BIN-B01-R5",
          "0x1D5F8A2C4E9B",
          "PRC-S-LUX",
          "Out of Stock (0)"
        ],
        [
          "SKU-MB-ROG-Z790F",
          "ASUS ROG Strix Z790-F Gaming WiFi II Motherboard",
          "BIN-C08-R3",
          "0x5E7A2C1D9F8B",
          "PRC-B-VAL",
          "In Stock (38)"
        ],
        [
          "SKU-PSU-1000W-AT3",
          "Corsair RM1000x Shift ATX 3.0 Fully Modular PSU",
          "BIN-D11-R1",
          "0x9A2C4E7B5D8F",
          "PRC-C-MID",
          "In Stock (59)"
        ],
        [
          "SKU-CASE-O11D-EVO",
          "Lian Li O11 Dynamic EVO XL Full Tower Chassis",
          "BIN-E04-R2",
          "0x2D4E6B8C9F0A",
          "PRC-C-MID",
          "In Stock (27)"
        ]
      ]
    }
  ]
};
