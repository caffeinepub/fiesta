import { useState } from 'react';
import { useSaveOrganizerProfile } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Variant_busy_available, type OrganizerProfile } from '../../backend';
import { toast } from 'sonner';

interface OrganizerProfileFormProps {
  existingProfile?: OrganizerProfile;
  onSuccess?: () => void;
}

export default function OrganizerProfileForm({ existingProfile, onSuccess }: OrganizerProfileFormProps) {
  const [companyName, setCompanyName] = useState(existingProfile?.companyName || '');
  const [contactNumber, setContactNumber] = useState(existingProfile?.contactNumber || '');
  const [experienceYears, setExperienceYears] = useState(existingProfile?.experienceYears.toString() || '');
  const [pricingRange, setPricingRange] = useState(existingProfile?.pricingRange || '');
  const [description, setDescription] = useState(existingProfile?.description || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<Variant_busy_available>(
    existingProfile?.availabilityStatus || Variant_busy_available.available
  );

  const saveProfile = useSaveOrganizerProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const experience = parseInt(experienceYears);
    if (isNaN(experience) || experience < 0) {
      toast.error('Please enter valid years of experience');
      return;
    }

    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!contactNumber.trim()) {
      toast.error('Contact number is required');
      return;
    }

    if (!pricingRange.trim()) {
      toast.error('Pricing range is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        companyName: companyName.trim(),
        contactNumber: contactNumber.trim(),
        experienceYears: BigInt(experience),
        pricingRange: pricingRange.trim(),
        description: description.trim(),
        availabilityStatus,
      });
      toast.success('Profile saved successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save profile';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Your company name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactNumber">Contact Number</Label>
        <Input
          id="contactNumber"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="+1 (555) 123-4567"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input
          id="experienceYears"
          type="number"
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          placeholder="5"
          min="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricingRange">Pricing Range</Label>
        <Input
          id="pricingRange"
          value={pricingRange}
          onChange={(e) => setPricingRange(e.target.value)}
          placeholder="$1,000 - $5,000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availabilityStatus">Availability Status</Label>
        <Select 
          value={availabilityStatus} 
          onValueChange={(value) => setAvailabilityStatus(value as Variant_busy_available)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Variant_busy_available.available}>Available</SelectItem>
            <SelectItem value={Variant_busy_available.busy}>Busy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell clients about your services..."
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
        {saveProfile.isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
