import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationLocalService, Notification } from '../../core/services/notification-local.service';

@Component({
  selector: 'app-notifications-popover',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Bell Icon Button -->
      <button 
        (click)="togglePopover()"
        class="relative p-2 text-foreground hover:bg-muted rounded-lg transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        <span *ngIf="(unreadCount$ | async) as unreadCount" [hidden]="unreadCount === 0" 
          class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
          {{ unreadCount }}
        </span>
      </button>

      <!-- Popover Content -->
      <div *ngIf="isOpen" class="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 flex flex-col max-h-96">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border p-4">
          <h3 class="font-semibold text-foreground">Notificaciones</h3>
          <button 
            *ngIf="(unreadCount$ | async) as unreadCount" [hidden]="unreadCount === 0"
            (click)="markAllAsRead()"
            class="text-xs text-primary hover:text-primary/80 font-medium">
            Marcar todas como leídas
          </button>
        </div>

        <!-- Notifications List -->
        <div class="flex-1 overflow-y-auto max-h-80">
          <div *ngIf="(notifications$ | async) as notifications" class="divide-y divide-border">
            <div *ngIf="notifications.length > 0; else noNotifications">
              <div *ngFor="let notification of notifications" 
                [ngClass]="!notification.read ? 'bg-primary/5' : ''"
                class="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-2"
                [class.border-primary]="!notification.read"
                [class.border-transparent]="notification.read"
                (click)="markAsRead(notification.id)">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <p class="font-medium text-sm text-foreground">{{ notification.title }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-muted-foreground mt-2">{{ notification.time }}</p>
                  </div>
                  <span class="text-lg">{{ getNotificationIcon(notification.type) }}</span>
                </div>
              </div>
            </div>

            <ng-template #noNotifications>
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <svg class="w-12 h-12 text-muted-foreground/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p class="text-sm text-muted-foreground">No tienes notificaciones</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Footer -->
        <div *ngIf="(notifications$ | async) as notifications" [hidden]="notifications.length === 0" 
          class="border-t border-border p-2">
          <button 
            (click)="closePopover()"
            class="w-full text-center px-4 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors">
            Ver todas las notificaciones
          </button>
        </div>
      </div>

      <!-- Overlay to close popover -->
      <div *ngIf="isOpen" (click)="closePopover()" class="fixed inset-0 z-40"></div>
    </div>
  `,
  styles: []
})
export class NotificationsPopoverComponent implements OnInit {
  private notificationService = inject(NotificationLocalService);

  isOpen = false;
  notifications$ = this.notificationService.notifications$;
  unreadCount$ = this.notificationService.unreadCount$;

  ngOnInit(): void {
    // Initialize notifications
  }

  togglePopover(): void {
    this.isOpen = !this.isOpen;
  }

  closePopover(): void {
    this.isOpen = false;
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        console.log('✅ Notificación marcada como leída');
      },
      error: (err) => console.error('❌ Error al marcar como leída:', err)
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('✅ Todas las notificaciones marcadas como leídas');
      },
      error: (err) => console.error('❌ Error al marcar todas como leídas:', err)
    });
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'session': '📚',
      'achievement': '🏆',
      'message': '💬',
      'system': '⚙️'
    };
    return icons[type] || '🔔';
  }
}
