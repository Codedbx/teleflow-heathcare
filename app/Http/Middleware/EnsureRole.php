<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Usage in routes:  ->middleware('role:admin,clinician')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || (count($roles) > 0 && ! in_array($user->role, $roles, true))) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}