import { describe, it, expect } from 'vitest';
import { ETFSimulator } from './ETFSimulator';
import { FundedPensionSimulator } from './FundedPensionSimulator';
import { printTable } from 'console-table-printer';

describe('Simulate ETF', () => {
    it('with linear interest', () => {
        console.log('Simulating FundedPension with linear interest');
        const fundedsimulator = new FundedPensionSimulator({
            TER: 0.002,
            yearlyInterest: 0.05,
            monthlyInput: 100,
            currentAge: 24,
            capitalPayout: true
        });
        const fundedEndAmount = fundedsimulator.runSimulation();
        console.log('Simulating ETF with linear interest');
        const etfsimulator = new ETFSimulator({
            TER: 0.002,
            yearlyInterest: 0.05,
            monthlyInput: 100
        });
        const etfEndAmount = etfsimulator.runSimulation(fundedEndAmount.months);
        const results = [
            { 'Field': 'finalAmount', 'Funded Pension': fundedEndAmount.finalAmount.toFixed(2), 'ETF': etfEndAmount.finalAmount.toFixed(2) },
            { 'Field': 'totalInvested', 'Funded Pension': fundedEndAmount.totalInvested.toFixed(2), 'ETF': etfEndAmount.totalInvested.toFixed(2) },
            { 'Field': 'totalTaxPaid', 'Funded Pension': fundedEndAmount.totalTaxPaid.toFixed(2), 'ETF': etfEndAmount.totalTaxPaid.toFixed(2) },
            { 'Field': 'months', 'Funded Pension': fundedEndAmount.months.toFixed(2), 'ETF': etfEndAmount.months.toFixed(2) }
        ]
        printTable(results)
    });
});