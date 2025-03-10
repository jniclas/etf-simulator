export interface ExampleType {
    id: number;
    name: string;
    description?: string;
}

export type ExampleArray = ExampleType[];

export type CallbackFunction = (data: ExampleType) => void;