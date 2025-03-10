interface ETFSimulatorConfig {
    TER: number; // e.g., 0.002 for 0.2%
    yearlyInterest: number; // expected market return, e.g., 0.07 for 7%
    monthlyInput: number;
    dividendYield?: number; // optional, e.g., 0.02 for 2% dividend
    accumulatingETF?: boolean; // true = accumulating ETF, false = distributing
    taxAllowance?: number; // e.g., 1000€ per year (default)
    baseInterestRate?: number; // Basiszins for Vorabpauschale, e.g., 0.0337 for 3.37%
}

export class ETFSimulator {
    private TER: number;
    private yearlyInterest: number;
    private monthlyInput: number;
    private dividendYield: number;
    private accumulatingETF: boolean;
    private taxAllowance: number;
    private baseInterestRate: number;

    private capitalGainsTaxRate = 0.26375; // 25% + 5.5% solidarity surcharge

    constructor({
        TER,
        yearlyInterest,
        monthlyInput,
        dividendYield = 0.02,
        accumulatingETF = true,
        taxAllowance = 1000,
        baseInterestRate = 0.0337, // Default: 3.37% for Vorabpauschale
    }: ETFSimulatorConfig) {
        this.TER = TER;
        this.yearlyInterest = yearlyInterest;
        this.monthlyInput = monthlyInput;
        this.dividendYield = dividendYield;
        this.accumulatingETF = accumulatingETF;
        this.taxAllowance = taxAllowance;
        this.baseInterestRate = baseInterestRate;
    }

    runSimulation(months: number): number {
        let totalInvested = 0;
        let totalAmount = 0;
        let totalDividends = 0;
        let totalTaxPaid = 0;
        let yearlyStartValue = 0;

        const adjustedYearlyInterest = this.yearlyInterest * (1 - this.TER);
        const monthlyInterestRate = adjustedYearlyInterest / 12;

        for (let i = 0; i < months; i++) {
            totalInvested += this.monthlyInput;
            totalAmount += this.monthlyInput;
            totalAmount += totalAmount * monthlyInterestRate;

            if (!this.accumulatingETF) {
                const monthlyDividends = totalAmount * (this.dividendYield / 12);
                totalDividends += monthlyDividends;
            }

            if (i % 12 === 0) {
                yearlyStartValue = totalAmount;
            }

            if ((i + 1) % 12 === 0) {
                let taxOwed = 0;

                if (this.accumulatingETF) {
                    const yearlyReturn = totalAmount - yearlyStartValue;
                    const baseReturn = yearlyStartValue * this.baseInterestRate * 0.7;
                    const taxableAmount = Math.min(yearlyReturn, baseReturn);
                    if (taxableAmount > 0) {
                        const vorabpauschaleTax = taxableAmount * this.capitalGainsTaxRate;
                        taxOwed += vorabpauschaleTax;
                    }
                } else {
                    const yearlyDividends = totalDividends;
                    const taxableDividends = Math.max(0, yearlyDividends - this.taxAllowance);
                    const dividendTax = taxableDividends * this.capitalGainsTaxRate;
                    taxOwed += dividendTax;
                }

                totalAmount -= taxOwed;
                totalTaxPaid += taxOwed;
                totalDividends = 0;
            }
        }

        const profit = totalAmount - totalInvested;
        const taxableProfit = Math.max(0, profit - this.taxAllowance);
        const capitalGainsTax = taxableProfit * this.capitalGainsTaxRate;
        totalAmount -= capitalGainsTax;
        totalTaxPaid += capitalGainsTax;

        console.log(`Total tax paid: €${totalTaxPaid.toFixed(2)}`);
        console.log(`Profit: €${profit.toFixed(2)}`);
        console.log(`ìnvested: €${totalInvested.toFixed(2)}`);
        console.log(`Final amount: €${totalAmount.toFixed(2)}`);
        return totalAmount;
    }
}
