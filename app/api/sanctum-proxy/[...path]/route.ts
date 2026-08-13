import { NextRequest, NextResponse } from "next/server"

import { getApiOrigin } from "@/lib/env"

type RouteContext = {
  params: Promise<{ path?: string[] }>
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path = [] } = await context.params
  const targetPath = path.join("/")
  const targetUrl = `${getApiOrigin()}/${targetPath}${request.nextUrl.search}`

  const headers = new Headers()
  const authorization = request.headers.get("authorization")
  if (authorization) headers.set("authorization", authorization)
  headers.set("accept", request.headers.get("accept") || "application/json")
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  const upstream = await fetch(targetUrl, init)
  const body = await upstream.arrayBuffer()
  const responseHeaders = new Headers()
  const upstreamContentType = upstream.headers.get("content-type")
  if (upstreamContentType) {
    responseHeaders.set("content-type", upstreamContentType)
  }

  return new NextResponse(body, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}
