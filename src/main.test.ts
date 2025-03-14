import { describe, it, expect } from 'vitest';
import { ETFSimulator } from './ETFSimulator';
import { FundedPensionSimulator } from './FundedPensionSimulator';
import { printTable } from 'console-table-printer';
import { ETFInterestCalculator } from './ETFInterestCalculator';

describe('Simulate ETF', () => {
    it('with linear interest', () => {
        const monthlyInput = 300;
        const TER = 0.002;
        const fundedsimulator = new FundedPensionSimulator({
            TER,
            yearlyInterest: 0.05,
            monthlyInput,
            currentAge: 24,
            capitalPayout: true
        });
        const fundedEndAmount = fundedsimulator.runSimulation();
        const etfsimulator = new ETFSimulator({
            TER,
            yearlyInterest: 0.05,
            monthlyInput
        });
        const etfEndAmount = etfsimulator.runSimulation(fundedEndAmount.months);
        const results = [
            { 'Field': 'finalAmount', 'Funded Pension': fundedEndAmount.finalAmount.toFixed(2), 'ETF': etfEndAmount.finalAmount.toFixed(2), 'Difference': (fundedEndAmount.finalAmount - etfEndAmount.finalAmount).toFixed(2) },
            { 'Field': 'totalInvested', 'Funded Pension': fundedEndAmount.totalInvested.toFixed(2), 'ETF': etfEndAmount.totalInvested.toFixed(2), 'Difference': (fundedEndAmount.totalInvested - etfEndAmount.totalInvested).toFixed(2) },
            { 'Field': 'totalTaxPaid', 'Funded Pension': fundedEndAmount.totalTaxPaid.toFixed(2), 'ETF': etfEndAmount.totalTaxPaid.toFixed(2), 'Difference': (fundedEndAmount.totalTaxPaid - etfEndAmount.totalTaxPaid).toFixed(2) },
            { 'Field': 'months', 'Funded Pension': fundedEndAmount.months.toFixed(2), 'ETF': etfEndAmount.months.toFixed(2), 'Difference': (fundedEndAmount.months - etfEndAmount.months).toFixed(2) },
            { 'Field': 'years', 'Funded Pension': (fundedEndAmount.months / 12).toFixed(2), 'ETF': (etfEndAmount.months / 12).toFixed(2), 'Difference': ((fundedEndAmount.months - etfEndAmount.months) / 12).toFixed(2) }
        ];
        console.log('With linear interest');
        printTable(results);
    });

    it('logs ETFInterestCalculator methods output', () => {
        // from https://curvo.eu/backtest/en/market-index/msci-world?currency=eur
        const calculator = new ETFInterestCalculator({
            csvFilePath: 'src/msciWorld.csv'
        });

        console.log('Calculating monthly interest');
        const monthlyInterest = calculator.getMonthlyInterestRates((2025 - 1978) * 12 + 1);

        console.log('First 2 elements of monthly interest:', monthlyInterest.slice(0, 2));
        console.log('Last 2 elements of monthly interest:', monthlyInterest.slice(-2));

        expect(monthlyInterest.length).toBeGreaterThan(0);
        expect(monthlyInterest[0]).equals(calculator.calculateAverageInterest());
    });

    it('with historical data', () => {
        const calculator = new ETFInterestCalculator({
            csvFilePath: 'src/msciWorld.csv'
        });
        const currentAge = 24;
        const retirementAge = 67;
        const years = retirementAge - currentAge;
        const monthlyInterest = calculator.getMonthlyInterestRates(years * 12 + 1);
        const monthlyInput = 300;
        const TER = 0.002;
        const fundedsimulator = new FundedPensionSimulator({
            TER,
            yearlyInterest: 0.05,
            monthlyInput,
            currentAge,
            retirementAge,
            capitalPayout: false
        });
        const fundedEndAmount = fundedsimulator.runSimulation(monthlyInterest);
        const etfsimulator = new ETFSimulator({
            TER,
            yearlyInterest: 0.05,
            monthlyInput
        });
        const etfEndAmount = etfsimulator.runSimulation(fundedEndAmount.months, monthlyInterest);
        const results = [
            { 'Field': 'finalAmount', 'Funded Pension': fundedEndAmount.finalAmount.toFixed(2), 'ETF': etfEndAmount.finalAmount.toFixed(2), 'Difference': (fundedEndAmount.finalAmount - etfEndAmount.finalAmount).toFixed(2) },
            { 'Field': 'totalInvested', 'Funded Pension': fundedEndAmount.totalInvested.toFixed(2), 'ETF': etfEndAmount.totalInvested.toFixed(2), 'Difference': (fundedEndAmount.totalInvested - etfEndAmount.totalInvested).toFixed(2) },
            { 'Field': 'totalTaxPaid', 'Funded Pension': fundedEndAmount.totalTaxPaid.toFixed(2), 'ETF': etfEndAmount.totalTaxPaid.toFixed(2), 'Difference': (fundedEndAmount.totalTaxPaid - etfEndAmount.totalTaxPaid).toFixed(2) },
            { 'Field': 'months', 'Funded Pension': fundedEndAmount.months.toFixed(2), 'ETF': etfEndAmount.months.toFixed(2), 'Difference': (fundedEndAmount.months - etfEndAmount.months).toFixed(2) },
            { 'Field': 'years', 'Funded Pension': (fundedEndAmount.months / 12).toFixed(2), 'ETF': (etfEndAmount.months / 12).toFixed(2), 'Difference': ((fundedEndAmount.months - etfEndAmount.months) / 12).toFixed(2) }
        ];
        console.log('WIth historical data')
        printTable(results);
    });
});