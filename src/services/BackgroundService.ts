import BackgroundActions from 'react-native-background-actions';

interface BackgroundTaskOptions {
  onTick: () => Promise<void>;
  interval: number;
}

class BackgroundService {
  private isRunning = false;

  async start(options: BackgroundTaskOptions): Promise<void> {
    if (this.isRunning) {
      console.log('Background service already running');
      return;
    }

    const backgroundOptions = {
      taskName: 'ParkPing',
      taskTitle: 'ParkPing är aktiv',
      taskDesc: 'Övervakar för parkering...',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#4A90D9',
      linkingURI: 'parkping://',
      parameters: {
        delay: options.interval,
      },
    };

    const backgroundTask = async (taskData?: {delay?: number}) => {
      const delay = taskData?.delay ?? options.interval;

      // Run continuously while the service is active
      await new Promise<void>(async resolve => {
        while (BackgroundActions.isRunning()) {
          try {
            await options.onTick();
          } catch (error) {
            console.error('Background task error:', error);
          }
          // Sleep for the specified interval
          await this.sleep(delay);
        }
        resolve();
      });
    };

    try {
      await BackgroundActions.start(backgroundTask, backgroundOptions);
      this.isRunning = true;
      console.log('Background service started');
    } catch (error) {
      console.error('Failed to start background service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Background service not running');
      return;
    }

    try {
      await BackgroundActions.stop();
      this.isRunning = false;
      console.log('Background service stopped');
    } catch (error) {
      console.error('Failed to stop background service:', error);
      throw error;
    }
  }

  isActive(): boolean {
    return BackgroundActions.isRunning();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateNotification(title: string, description: string): Promise<void> {
    if (this.isRunning) {
      await BackgroundActions.updateNotification({
        taskTitle: title,
        taskDesc: description,
      });
    }
  }
}

export const backgroundService = new BackgroundService();
