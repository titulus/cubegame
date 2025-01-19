export let status: string = '';

export function setStatus(newStatus: string): void {
    status = newStatus;
}

export function getStatus(): string {
    return status;
}