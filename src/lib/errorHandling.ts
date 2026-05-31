import { NextResponse } from "next/server"

export class ServiceError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
        this.name = "ServiceError"
    }
}

export function handleControllerError(error: unknown, fallbackMessage: string) {
    if (error instanceof ServiceError) {
        return NextResponse.json({ message: error.message }, { status: error.status })
    }
    console.log("Unexpected error:", error)
    return NextResponse.json({ message: fallbackMessage }, { status: 500 })
}
