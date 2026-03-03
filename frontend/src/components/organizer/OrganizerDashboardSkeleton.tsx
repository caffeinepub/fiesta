import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function OrganizerDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        {/* Profile Card Skeleton */}
        <Card className="border-navy-200">
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
            <Skeleton className="h-16 w-full rounded-md" />
          </CardContent>
        </Card>

        <Separator className="border-navy-100" />

        {/* Booking Requests Skeleton */}
        <Card className="border-navy-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-72 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-navy-100 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator className="border-navy-100" />

        {/* Portfolio Section Skeleton */}
        <Card className="border-navy-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-36" />
            </div>
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="border-navy-100" />

        {/* Event Photos Section Skeleton */}
        <Card className="border-navy-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-80 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
