import { describe, it, expect } from 'vitest';
import { ETFSimulator } from './ETFSimulator';

describe('Simulate ETF', () => {
    it('with linear interest', () => {
        const simulator = new ETFSimulator({
            TER: 0.002,
            yearlyInterest: 0.05,
            monthlyInput: 100
        });
        const endAmount = simulator.runSimulation(10*12);
    });
});