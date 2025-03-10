interface ETFSimulatorConfig {
    TER: number; // e.g., 0.002 for 0.2%
    yearlyInterest: number; // expected market return, e.g., 0.07 for 7%
    monthlyInput: number;
    dividendYield?: number; // optional, e.g., 0.02 for 2% dividend
    accumulatingETF?: boolean; // true = accumulating ETF, false = distributing
    taxAllowance?: number; // e.g., 1000€ per year (default)
}

export class ETFSimulator {
    private TER: number;
    private yearlyInterest: number;
    private monthlyInput: number;
    private dividendYield: number;
    private accumulatingETF: boolean;
    private taxAllowance: number;

    private capitalGainsTaxRate = 0.26375; // 25% + 5.5% solidarity surcharge
    private riskFreeRate = 0.01; // Example: 1% (used for Vorabpauschale)

    constructor({
        TER,
        yearlyInterest,
        monthlyInput,
        dividendYield = 0.02, // Default to 2% dividend yield
        accumulatingETF = true,
        taxAllowance = 1000, // Default tax-free savings allowance in Germany
    }: ETFSimulatorConfig) {
        this.TER = TER;
        this.yearlyInterest = yearlyInterest;
        this.monthlyInput = monthlyInput;
        this.dividendYield = dividendYield;
        this.accumulatingETF = accumulatingETF;
        this.taxAllowance = taxAllowance;
    }

    runSimulation(months: number): number {
        let totalInvested = 0;
        let totalAmount = 0;
        let totalDividends = 0;
        let totalTaxPaid = 0;

        const adjustedYearlyInterest = this.yearlyInterest * (1 - this.TER);
        const monthlyInterestRate = adjustedYearlyInterest / 12;

        for (let i = 0; i < months; i++) {
            totalInvested += this.monthlyInput;
            totalAmount += this.monthlyInput;
            totalAmount += totalAmount * monthlyInterestRate;

            if (!this.accumulatingETF) {
                // Dividends for distributing ETFs
                const monthlyDividends = totalAmount * (this.dividendYield / 12);
                totalDividends += monthlyDividends;
            }

            // Apply annual taxes at the end of each year
            if ((i + 1) % 12 === 0) {
                let taxOwed = 0;

                if (this.accumulatingETF) {
                    // Apply Vorabpauschale tax
                    const assumedProfit = totalAmount * (this.riskFreeRate * 0.7);
                    const prepaidTax = Math.max(0, assumedProfit * this.capitalGainsTaxRate);
                    taxOwed += prepaidTax;
                } else {
                    // Tax on dividends
                    const yearlyDividends = totalDividends;
                    const taxableDividends = Math.max(0, yearlyDividends - this.taxAllowance);
                    const dividendTax = taxableDividends * this.capitalGainsTaxRate;
                    taxOwed += dividendTax;
                }

                // Deduct tax from total amount
                totalAmount -= taxOwed;
                totalTaxPaid += taxOwed;
                totalDividends = 0; // Reset yearly dividend tracker
            }
        }

        // Apply capital gains tax when selling
        const profit = totalAmount - totalInvested;
        const taxableProfit = Math.max(0, profit - this.taxAllowance);
        const capitalGainsTax = taxableProfit * this.capitalGainsTaxRate;
        totalAmount -= capitalGainsTax;
        totalTaxPaid += capitalGainsTax;

        console.log(`Total tax paid: €${totalTaxPaid.toFixed(2)}`);
        console.log(`End amount after ${months} months (${(months/12).toFixed(1)} years): €${totalAmount.toFixed(2)}`);
        return totalAmount;
    }
}
