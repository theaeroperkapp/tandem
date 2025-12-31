'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchedListing } from '@/types';
import {
  Building2,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Car,
  Coffee,
  Monitor,
  Wifi,
  FileText,
} from 'lucide-react';

interface ListingCardProps {
  listing: MatchedListing;
  onGenerateLease?: () => void;
  showDetails?: boolean;
}

const amenityIcons: Record<string, typeof Building2> = {
  conference_rooms: Monitor,
  kitchen: Coffee,
  parking_spots: Car,
  '24_7_access': Wifi,
};

export function ListingCard({ listing, onGenerateLease, showDetails = false }: ListingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-muted">
        {listing.primary_image_url ? (
          <Image
            src={listing.primary_image_url}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {/* Match Score Badge */}
        <div className="absolute top-2 right-2">
          <Badge
            variant={listing.matchScore >= 80 ? 'default' : 'secondary'}
            className="text-sm font-semibold"
          >
            {listing.matchScore}% Match
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{listing.title}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {listing.neighborhood}, {listing.city}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{formatPrice(listing.price_per_month)}</span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Up to {listing.max_capacity}</span>
          </div>
          <div className="col-span-2 text-muted-foreground">
            {listing.square_feet.toLocaleString()} sqft &middot; ${listing.price_per_sqft}/sqft
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Available {formatDate(listing.available_date)}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(listing.amenities).map(([key, value]) => {
            if (!value) return null;
            const Icon = amenityIcons[key] || Building2;
            const label = typeof value === 'number'
              ? `${value} ${key.replace(/_/g, ' ')}`
              : key.replace(/_/g, ' ');
            return (
              <Badge key={key} variant="outline" className="text-xs">
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            );
          })}
        </div>

        {/* Why This Match */}
        {listing.reasoning && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-xs font-medium mb-1">Why this works:</p>
            <p className="text-xs text-muted-foreground">{listing.reasoning}</p>
          </div>
        )}

        {/* Highlights */}
        {showDetails && listing.highlights && listing.highlights.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Highlights:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {listing.highlights.map((h, i) => (
                <li key={i}>• {h}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      {onGenerateLease && (
        <CardFooter className="pt-0">
          <Button onClick={onGenerateLease} className="w-full" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Lease
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
