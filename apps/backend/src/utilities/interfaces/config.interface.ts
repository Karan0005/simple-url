export interface IApplicationConfiguration {
    server: {
        port: number;
        env: string;
        routePrefix: string;
        apiBaseURL: string;
        appBaseURL: string;
        secret: string;
    };
    redis: {
        minVersion: string;
        host: string;
        port: number;
    };
    mongodb: {
        minVersion: string;
        uri: string;
    };
}

export interface ISecretManagerConfig {
    KeyVaultURI: string;
    TenantId: string;
    ClientId: string;
    ClientSecret: string;
}
