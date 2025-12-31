'use client';

import { MatchedListing } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText } from 'lucide-react';

interface ComparisonViewProps {
  listings: MatchedListing[];
  onGenerateLease?: (listingId: string) => void;
}

export function ComparisonView({ listings, onGenerateLease }: ComparisonViewProps) {
  if (listings.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderBooleanValue = (value: unknown) => {
    if (value === true) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (value === false || value === undefined) {
      return <X className="h-4 w-4 text-muted-foreground" />;
    }
    return <span>{String(value)}</span>;
  };

  const allAmenities = new Set<string>();
  listings.forEach(l => {
    Object.keys(l.amenities).forEach(a => allAmenities.add(a));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Spaces</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-medium"></th>
                {listings.map(listing => (
                  <th key={listing.id} className="text-left py-2 px-4 font-medium min-w-[200px]">
                    <div className="space-y-1">
                      <div>{listing.title}</div>
                      <Badge variant="outline">{listing.matchScore}% Match</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Monthly Cost */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Monthly Rent</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4 font-semibold">
                    {formatPrice(l.price_per_month)}
                  </td>
                ))}
              </tr>

              {/* Size */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Square Feet</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    {l.square_feet.toLocaleString()} sqft
                  </td>
                ))}
              </tr>

              {/* Price per sqft */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">$/sqft</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    ${l.price_per_sqft.toFixed(2)}
                  </td>
                ))}
              </tr>

              {/* Capacity */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Max Capacity</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    {l.max_capacity} people
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Neighborhood</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    {l.neighborhood}
                  </td>
                ))}
              </tr>

              {/* Lease Term */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Min Lease</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    {l.min_lease_months} months
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="border-b">
                <td className="py-2 px-2 font-medium">Available</td>
                {listings.map(l => (
                  <td key={l.id} className="py-2 px-4">
                    {new Date(l.available_date).toLocaleDateString()}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              {Array.from(allAmenities).map(amenity => (
                <tr key={amenity} className="border-b">
                  <td className="py-2 px-2 font-medium capitalize">
                    {amenity.replace(/_/g, ' ')}
                  </td>
                  {listings.map(l => (
                    <td key={l.id} className="py-2 px-4">
                      {renderBooleanValue(l.amenities[amenity as keyof typeof l.amenities])}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Actions */}
              {onGenerateLease && (
                <tr>
                  <td className="py-3 px-2"></td>
                  {listings.map(l => (
                    <td key={l.id} className="py-3 px-4">
                      <Button
                        onClick={() => onGenerateLease(l.id)}
                        size="sm"
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Lease
                      </Button>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
