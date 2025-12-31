'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MatchedListing } from '@/types';
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  Car,
  Coffee,
  Monitor,
  Wifi,
  FileText,
  Sparkles,
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

export function ListingCard({ listing, onGenerateLease }: ListingCardProps) {
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
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {listing.primary_image_url ? (
          <Image
            src={listing.primary_image_url}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <Building2 className="h-10 w-10 text-primary/30" />
          </div>
        )}
        {/* Match Score Badge */}
        <div className="absolute top-2 right-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-semibold ${getScoreColor(listing.matchScore)}`}>
            <Sparkles className="h-3 w-3" />
            {listing.matchScore}%
          </div>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p className="text-white font-bold text-lg">{formatPrice(listing.price_per_month)}<span className="text-white/80 text-sm font-normal">/mo</span></p>
        </div>
      </div>

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="font-semibold text-sm line-clamp-1">{listing.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3" />
            {listing.neighborhood}, {listing.city === 'San Francisco' ? 'SF' : 'NYC'}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{listing.max_capacity} people</span>
          </div>
          <div className="text-muted-foreground">
            {listing.square_feet.toLocaleString()} sqft
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Available {formatDate(listing.available_date)}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(listing.amenities).slice(0, 4).map(([key, value]) => {
            if (!value) return null;
            const Icon = amenityIcons[key] || Building2;
            return (
              <Badge key={key} variant="secondary" className="text-[10px] px-1.5 py-0.5 font-normal">
                <Icon className="h-2.5 w-2.5 mr-0.5" />
                {typeof value === 'number' ? value : ''}
                {key.replace(/_/g, ' ').replace('24 7', '24/7')}
              </Badge>
            );
          })}
        </div>

        {/* Why This Match */}
        {listing.reasoning && (
          <div className="pt-2 border-t">
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {listing.reasoning}
            </p>
          </div>
        )}
      </CardContent>

      {onGenerateLease && (
        <CardFooter className="p-3 pt-0">
          <Button onClick={onGenerateLease} className="w-full h-8 text-xs" size="sm">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Generate Lease
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
