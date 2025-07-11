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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock activity data - in a real app this would come from an API
const mockActivities = [
  {
    id: 1,
    action: 'Connexion',
    type: 'sign_in',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    ipAddress: '192.168.1.1'
  },
  {
    id: 2,
    action: 'Compte mis à jour',
    type: 'account_update',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    ipAddress: '192.168.1.1'
  },
  {
    id: 3,
    action: 'Mot de passe modifié',
    type: 'password_change',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    ipAddress: '192.168.1.1'
  },
  {
    id: 4,
    action: 'Inscription',
    type: 'sign_up',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    ipAddress: '192.168.1.1'
  }
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'sign_up':
      return <UserPlus className="h-4 w-4" />;
    case 'sign_in':
      return <LogIn className="h-4 w-4" />;
    case 'sign_out':
      return <LogOut className="h-4 w-4" />;
    case 'account_update':
      return <Settings className="h-4 w-4" />;
    case 'password_change':
      return <Shield className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'sign_up':
      return 'text-green-600 bg-green-100';
    case 'sign_in':
      return 'text-blue-600 bg-blue-100';
    case 'sign_out':
      return 'text-gray-600 bg-gray-100';
    case 'account_update':
      return 'text-orange-600 bg-orange-100';
    case 'password_change':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
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
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Journal d'Activité</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  getActivityColor(activity.type)
                )}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{formatRelativeTime(activity.timestamp)}</span>
                    <span>•</span>
                    <span>IP: {activity.ipAddress}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {activity.timestamp.toLocaleString('fr-FR', {
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

          {mockActivities.length === 0 && (
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