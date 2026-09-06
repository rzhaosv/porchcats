import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Porch: undefined;
  Shop: undefined;
  Catbook: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Club: { fromOnboarding?: boolean; reason?: 'gold' | 'backyard' | 'food' | 'jeeves' | 'exchange' } | undefined;
  CatDetail: { id: string };
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type TabProps<T extends keyof TabParamList> = CompositeScreenProps<BottomTabScreenProps<TabParamList, T>, NativeStackScreenProps<RootStackParamList>>;
export type RootNav = NativeStackNavigationProp<RootStackParamList>;
