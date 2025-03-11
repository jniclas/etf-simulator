import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface ETFInterestCalculatorConfig {
    csvFilePath: string;
}

export class ETFInterestCalculator {
    private data: { date: string; value: number }[] = [];

    constructor({ csvFilePath }: ETFInterestCalculatorConfig) {
        const csvContent = fs.readFileSync(path.resolve(csvFilePath), 'utf-8');
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        });

        this.data = records.map((record: any) => ({
            date: record.Date,
            value: parseFloat(record['MSCI World'])
        }));
    }

    getMonthlyInterestRates(months: number): number[] {
        const interestRates: number[] = [];
        const totalMonths = this.data.length;

        if (months > totalMonths) {
            const averageInterest = this.calculateAverageInterest();
            for (let i = 0; i < months - totalMonths; i++) {
                interestRates.push(averageInterest);
            }
        }

        for (let i = totalMonths - months; i < totalMonths - 1; i++) {
            const currentValue = this.data[i].value;
            const nextValue = this.data[i + 1].value;
            const monthlyInterest = (nextValue - currentValue) / currentValue;
            interestRates.push(monthlyInterest);
        }

        return interestRates;
    }

    private calculateAverageInterest(): number {
        let totalInterest = 0;
        for (let i = 0; i < this.data.length - 1; i++) {
            const currentValue = this.data[i].value;
            const nextValue = this.data[i + 1].value;
            const monthlyInterest = (nextValue - currentValue) / currentValue;
            totalInterest += monthlyInterest;
        }
        return totalInterest / (this.data.length - 1);
    }
}