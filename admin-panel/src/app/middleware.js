import { NextResponse } from "next/server";

export function middleware(request) {

    /* Fake Auth */
    const isLoggedIn =
        request.cookies.get("admin-auth");

    /* Protected Routes */
    const protectedRoutes = [
        "/",
        "/products",
        "/orders",
        "/users",
        "/analytics",
        "/settings",
    ];

    const isProtected =
        protectedRoutes.some((route) =>

            request.nextUrl.pathname === route
        );

    /* Redirect */
    if (
        isProtected &&
        !isLoggedIn
    ) {

        return NextResponse.redirect(
            new URL(
                "/login",
                request.url
            )
        );
    }

    return NextResponse.next();
}