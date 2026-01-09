import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserSettings {
  id: string;
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  soundEffects: boolean;
  pomodoroTime: number;
  autoSave: boolean;
}

const defaultSettings: Omit<UserSettings, 'id'> = {
  theme: 'dark',
  language: 'pt-BR',
  notificationsEnabled: true,
  emailNotifications: true,
  soundEffects: true,
  pomodoroTime: 25,
  autoSave: true,
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          theme: data.theme || 'dark',
          language: data.language || 'pt-BR',
          notificationsEnabled: data.notifications_enabled ?? true,
          emailNotifications: data.email_notifications ?? true,
          soundEffects: data.sound_effects ?? true,
          pomodoroTime: data.pomodoro_time || 25,
          autoSave: data.auto_save ?? true,
        });
      } else {
        // Create default settings if none exist
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            theme: defaultSettings.theme,
            language: defaultSettings.language,
            notifications_enabled: defaultSettings.notificationsEnabled,
            email_notifications: defaultSettings.emailNotifications,
            sound_effects: defaultSettings.soundEffects,
            pomodoro_time: defaultSettings.pomodoroTime,
            auto_save: defaultSettings.autoSave,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setSettings({
          id: newData.id,
          theme: newData.theme || 'dark',
          language: newData.language || 'pt-BR',
          notificationsEnabled: newData.notifications_enabled ?? true,
          emailNotifications: newData.email_notifications ?? true,
          soundEffects: newData.sound_effects ?? true,
          pomodoroTime: newData.pomodoro_time || 25,
          autoSave: newData.auto_save ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults on error
      setSettings({ id: 'local', ...defaultSettings });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (data: Partial<Omit<UserSettings, 'id'>>) => {
    if (!settings) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.notificationsEnabled !== undefined) updateData.notifications_enabled = data.notificationsEnabled;
      if (data.emailNotifications !== undefined) updateData.email_notifications = data.emailNotifications;
      if (data.soundEffects !== undefined) updateData.sound_effects = data.soundEffects;
      if (data.pomodoroTime !== undefined) updateData.pomodoro_time = data.pomodoroTime;
      if (data.autoSave !== undefined) updateData.auto_save = data.autoSave;

      if (settings.id !== 'local') {
        const { error } = await supabase.from('user_settings').update(updateData).eq('id', settings.id);
        if (error) throw error;
      }

      setSettings((prev) => (prev ? { ...prev, ...data } : null));
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao salvar configurações');
      return false;
    }
  };

  const saveAllSettings = async () => {
    toast.success('Configurações salvas!');
    return true;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    saveAllSettings,
    refetch: fetchSettings,
  };
}
