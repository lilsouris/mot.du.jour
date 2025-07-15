'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  UserPlus, 
  LogIn, 
  LogOut, 
  Settings, 
  Shield,
  Clock,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { ActivityLog } from '@/lib/activity/logger';

// Activity type mapping for icons and colors
const activityTypeMap: Record<string, { icon: any; color: string }> = {
  login: { icon: LogIn, color: 'text-blue-600 bg-blue-100' },
  logout: { icon: LogOut, color: 'text-gray-600 bg-gray-100' },
  password_change: { icon: Shield, color: 'text-purple-600 bg-purple-100' },
  account_created: { icon: UserPlus, color: 'text-green-600 bg-green-100' },
  account_updated: { icon: Settings, color: 'text-orange-600 bg-orange-100' },
  account_deleted: { icon: UserPlus, color: 'text-red-600 bg-red-100' },
  subscription_created: { icon: CreditCard, color: 'text-green-600 bg-green-100' },
  subscription_updated: { icon: CreditCard, color: 'text-orange-600 bg-orange-100' },
  subscription_cancelled: { icon: CreditCard, color: 'text-red-600 bg-red-100' },
  message_sent: { icon: MessageCircle, color: 'text-blue-600 bg-blue-100' }
};

function getActivityIcon(type: string) {
  const config = activityTypeMap[type];
  if (config) {
    const IconComponent = config.icon;
    return <IconComponent className="h-4 w-4" />;
  }
  return <Clock className="h-4 w-4" />;
}

function getActivityColor(type: string) {
  const config = activityTypeMap[type];
  return config?.color || 'text-gray-600 bg-gray-100';
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Il y a quelques secondes';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/api/activity');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">Journal d'Activité</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-spin" />
              <p>Chargement des activités...</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Journal d'Activité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  getActivityColor(activity.action)
                )}>
                  {getActivityIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>{formatRelativeTime(new Date(activity.timestamp))}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune activité récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}