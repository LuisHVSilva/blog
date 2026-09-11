/** Transport-independent contract. Dependencies belong in the constructor, not the payload. */
export interface IUseCase<Input, Output> {
    execute(payload: Readonly<Input>): Promise<Output>;
}
