interface FundedPensionConfig {
    TER: number; // z. B. 0.002 für 0.2%
    yearlyInterest: number; // Erwartete Marktrendite, z. B. 0.07 für 7%
    monthlyInput: number; // Monatliche Einzahlung
    insuranceFeeRate?: number; // Versicherungskosten als Prozentsatz (z. B. 0.008 für 0.8%)
    retirementAge?: number; // Renteneintrittsalter (z. B. 67)
    currentAge: number; // Alter des Sparers bei Beginn
    capitalPayout?: boolean; // true = Kapitalauszahlung, false = lebenslange Rente
}

export class FundedPensionSimulator {
    private TER: number;
    private yearlyInterest: number;
    private monthlyInput: number;
    private insuranceFeeRate: number;
    private retirementAge: number;
    private currentAge: number;
    private capitalPayout: boolean;

    private capitalGainsTaxRate = 0.26375; // 25% Abgeltungssteuer + 5.5% Soli
    private ertragsanteilTaxRates = { // Ertragsanteil nach Alter bei Rentenbeginn
        60: 20, 62: 19, 65: 18, 67: 17, 70: 15, 75: 11, 80: 7
    };

    constructor({
        TER,
        yearlyInterest,
        monthlyInput,
        currentAge,
        insuranceFeeRate = 0.008, // Standard 0.8% pro Jahr
        retirementAge = 67, // Standard Renteneintrittsalter
        capitalPayout = true, // Standard Kapitalauszahlung
    }: FundedPensionConfig) {
        this.TER = TER;
        this.yearlyInterest = yearlyInterest;
        this.monthlyInput = monthlyInput;
        this.insuranceFeeRate = insuranceFeeRate;
        this.retirementAge = retirementAge;
        this.currentAge = currentAge;
        this.capitalPayout = capitalPayout;
    }

    runSimulation(interestByMonth?: number[]): { finalAmount: number; totalInvested: number; totalTaxPaid: number, months: number } {
        let totalInvested = 0;
        let totalAmount = 0;
        let totalTaxPaid = 0;

        const months = interestByMonth ? interestByMonth.length : (this.retirementAge - this.currentAge) * 12;
        const adjustedYearlyInterest = this.yearlyInterest * (1 - this.TER);
        const monthlyInterestRate = adjustedYearlyInterest / 12;

        for (let i = 0; i < months; i++) {
            totalInvested += this.monthlyInput;
            totalAmount += this.monthlyInput;

            const interestRate = interestByMonth ? (interestByMonth[i] - this.TER / 12) : monthlyInterestRate;
            totalAmount += totalAmount * interestRate;

            // Versicherungskosten berechnen (0.8% p.a. → 0.0667% pro Monat)
            const insuranceFee = totalAmount * (this.insuranceFeeRate / 12);
            totalAmount -= insuranceFee;
        }

        const profit = totalAmount - totalInvested;

        if (this.capitalPayout) {
            // Kapitalauszahlung: Nur 50% des Gewinns steuerpflichtig
            const taxableProfit = profit * 0.5;
            const tax = taxableProfit * this.capitalGainsTaxRate;
            totalAmount -= tax;
            totalTaxPaid += tax;
        } else {
            // Rentenzahlung: Besteuerung nach Ertragsanteil
            const taxRate = this.ertragsanteilTaxRates[this.retirementAge] || 17;
            const taxablePart = profit * (taxRate / 100);
            const tax = taxablePart * this.capitalGainsTaxRate;
            totalAmount -= tax;
            totalTaxPaid += tax;
        }

        return {
            finalAmount: totalAmount,
            totalInvested,
            totalTaxPaid,
            months
        };
    }
}
