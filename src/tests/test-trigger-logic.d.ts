/**
 * Simple Trigger Logic Test (No Async)
 */
declare function calculateChange(current: number, baseline: number): number;
declare const tests: {
    current: number;
    baseline: number;
    expected: number;
}[];
interface TriggerConfig {
    baseline: number;
    triggerPercent: number;
}
declare function shouldTrigger(currentPrice: number, config: TriggerConfig): boolean;
declare const config: TriggerConfig;
declare const priceTests: {
    price: number;
    shouldFire: boolean;
}[];
declare function calculateSellAmount(holdings: number, sellPercent: number): number;
declare const holdingsTests: {
    holdings: number;
    percent: number;
    expected: number;
}[];
interface TriggerState {
    triggered: boolean;
    checkCount: number;
}
declare const state: TriggerState;
declare function checkTrigger(price: number): boolean;
//# sourceMappingURL=test-trigger-logic.d.ts.map