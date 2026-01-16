/**
 * メニュー設定ファイル
 * 各ロールのナビゲーションメニューを定義
 */

import {
  Home, Calendar, ShieldAlert, User, Briefcase,
  MapPin, Settings, LogOut, LayoutDashboard, JapaneseYen,
  PieChart, BarChart3, Building2, UserPlus, HelpCircle,
  Activity, ClipboardCheck, Megaphone, Palette, Map as MapIcon,
  Gift, CreditCard, Siren, Zap, Users, MessageSquare
} from 'lucide-react';
import { Role } from '../../types';

export interface MenuItem {
  label: string;
  path: string;
  icon: any;
  description?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export type MenuConfig = {
  [key in Role]?: MenuGroup[];
}

/**
 * 全ロールのメニュー設定
 */
export const MENU_CONFIG: MenuConfig = {
  // ============================================
  // ユーザー (USER)
  // ============================================
  [Role.USER]: [
    {
      title: 'サービス',
      items: [
        { label: 'ホーム', path: '/app', icon: Home, description: 'トップページ' },
        { label: 'マップ検索', path: '/app/map', icon: MapIcon, description: '地図から施設を探す' },
        { label: '予約一覧', path: '/app/bookings', icon: Calendar, description: '予約履歴を確認' },
        { label: 'サブスク', path: '/app/subscriptions', icon: Zap, description: 'サブスクリプション' },
      ]
    },
    {
      title: '健康管理',
      items: [
        { label: '身体の記録', path: '/app/account/wellness', icon: Activity, description: 'ウェルネスジャーナル' },
        { label: 'ギフト', path: '/app/gifting', icon: Gift, description: 'ギフトを贈る' },
      ]
    },
    {
      title: '設定・サポート',
      items: [
        { label: 'アカウント設定', path: '/app/account', icon: User, description: 'プロフィール設定' },
        { label: 'サポート', path: '/app/support', icon: HelpCircle, description: 'お問い合わせ' },
      ]
    }
  ],

  // ============================================
  // セラピスト (THERAPIST)
  // ============================================
  [Role.THERAPIST]: [
    {
      title: '業務管理',
      items: [
        { label: 'ダッシュボード', path: '/t', icon: LayoutDashboard, description: '業務概要' },
        { label: 'スケジュール', path: '/t/calendar', icon: Calendar, description: '予約カレンダー' },
      ]
    },
    {
      title: '報酬・設定',
      items: [
        { label: '報酬明細', path: '/t/earnings', icon: JapaneseYen, description: '収益確認' },
        { label: 'プロフィール設定', path: '/t/profile', icon: Settings, description: 'プロフィール編集' },
        { label: '自己PR編集', path: '/t/bio', icon: Palette, description: 'プロフィール詳細' },
      ]
    },
    {
      title: '安全',
      items: [
        { label: '安全センター', path: '/t/safety', icon: ShieldAlert, description: '安全管理' },
      ]
    }
  ],

  // ============================================
  // 事務所 (THERAPIST_OFFICE)
  // ============================================
  [Role.THERAPIST_OFFICE]: [
    {
      title: '事務所運営',
      items: [
        { label: 'ダッシュボード', path: '/o', icon: LayoutDashboard, description: '運営概要' },
        { label: 'セラピスト管理', path: '/o/therapists', icon: Users, description: '所属セラピスト' },
        { label: '採用管理', path: '/o/recruitment', icon: UserPlus, description: '採用募集' },
      ]
    },
    {
      title: '財務・メニュー',
      items: [
        { label: '収益管理', path: '/o/earnings', icon: JapaneseYen, description: '収益分配' },
        { label: '料金・メニュー', path: '/o/menu', icon: ClipboardCheck, description: '価格設定' },
      ]
    },
    {
      title: '安全・サポート',
      items: [
        { label: '安全監視', path: '/o/safety', icon: Siren, description: '安全管理' },
        { label: 'サポート受信箱', path: '/o/support', icon: MessageSquare, description: 'お問い合わせ対応' },
      ]
    },
    {
      title: '設定',
      items: [
        { label: '事務所設定', path: '/o/settings', icon: Settings, description: '組織設定' },
      ]
    }
  ],

  // ============================================
  // ホスト (HOST)
  // ============================================
  [Role.HOST]: [
    {
      title: '施設運営',
      items: [
        { label: 'ダッシュボード', path: '/h', icon: LayoutDashboard, description: '施設概要' },
        { label: '施設管理', path: '/h/sites', icon: MapPin, description: '施設情報' },
      ]
    },
    {
      title: '財務・安全',
      items: [
        { label: '収益明細', path: '/h/earnings', icon: JapaneseYen, description: '収益確認' },
        { label: 'インシデント報告', path: '/h/incidents', icon: ShieldAlert, description: '異常報告' },
      ]
    }
  ],

  // ============================================
  // アフィリエイト (AFFILIATE)
  // ============================================
  [Role.AFFILIATE]: [
    {
      title: 'アフィリエイト',
      items: [
        { label: 'ダッシュボード', path: '/affiliate', icon: LayoutDashboard, description: '成果概要' },
        { label: '報酬明細', path: '/affiliate/earnings', icon: JapaneseYen, description: '報酬確認' },
      ]
    }
  ],

  // ============================================
  // 管理者 (ADMIN)
  // ============================================
  [Role.ADMIN]: [
    {
      title: 'メイン',
      items: [
        { label: 'ダッシュボード', path: '/admin', icon: LayoutDashboard, description: '全体概要' },
        { label: 'ユーザー管理', path: '/admin/users', icon: Users, description: 'ユーザー一覧' },
        { label: '施設管理', path: '/admin/site-management', icon: Building2, description: '施設一覧' },
        { label: '予約管理', path: '/admin/logs', icon: ClipboardCheck, description: '予約ログ' },
      ]
    },
    {
      title: '財務・売上',
      items: [
        { label: '売上・支払い', path: '/admin/payouts', icon: JapaneseYen, description: '精算管理' },
        { label: '売上設定', path: '/admin/revenue-config', icon: Settings, description: '収益設定' },
        { label: 'Stripe管理', path: '/admin/stripe', icon: CreditCard, description: '決済管理' },
      ]
    },
    {
      title: 'システム',
      items: [
        { label: 'アナリティクス', path: '/admin/analytics', icon: BarChart3, description: 'データ分析' },
        { label: 'インシデント管理', path: '/admin/incidents', icon: ShieldAlert, description: 'インシデント' },
        { label: 'メール設定', path: '/admin/emails', icon: MessageSquare, description: 'メール管理' },
        { label: 'アフィリエイト', path: '/admin/affiliates', icon: Megaphone, description: 'アフィリエイト管理' },
      ]
    },
    {
      title: 'サポート',
      items: [
        { label: 'お問い合わせ', path: '/admin/support', icon: HelpCircle, description: 'サポート受信' },
      ]
    }
  ]
};

/**
 * ロールに応じたメニューを取得
 */
export const getMenuForRole = (role?: Role): MenuGroup[] => {
  if (!role) return [];
  return MENU_CONFIG[role] || [];
};
