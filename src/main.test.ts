import { describe, it, expect } from 'vitest';
import { ETFSimulator } from './ETFSimulator';
import { FundedPensionSimulator } from './FundedPensionSimulator';

describe('Simulate ETF', () => {
    it('with linear interest', () => {
        const fundedsimulator = new FundedPensionSimulator({
            TER: 0.002,
            yearlyInterest: 0.05,
            monthlyInput: 100,
            currentAge: 24,
        });
        const fundedEndAmount = fundedsimulator.runSimulation();
        const etfsimulator = new ETFSimulator({
            TER: 0.002,
            yearlyInterest: 0.05,
            monthlyInput: 100
        });
        const etfEndAmount = etfsimulator.runSimulation(fundedEndAmount.months);

    });
});