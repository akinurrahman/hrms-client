import { useNavigate } from 'react-router';

import { useTheme } from 'next-themes';
import { Check, LogOut, Monitor, Moon, Sun, UserCircle, type LucideIcon } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { useLogout } from '@/features/auth';
import { displayNameFromEmail, getInitials } from '@/lib';
import { useAuthStore } from '@/stores/auth.store';

const MODES: { value: string; label: string; hint: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Light', hint: 'Daytime ledger', icon: Sun },
    { value: 'dark', label: 'Dark', hint: 'Low-light desk', icon: Moon },
    { value: 'system', label: 'System', hint: 'Match device', icon: Monitor },
];

/**
 * Account panel at the foot of the sidebar: the identity it shows is also the
 * handle for theme, profile and sign-out, so the header carries no avatar.
 */
export function UserMenu() {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const logout = useLogout();
    const { theme, setTheme } = useTheme();
    const { state, isMobile } = useSidebar();
    const collapsed = state === 'collapsed' && !isMobile;

    const fullName = user
        ? (user.fullName ?? displayNameFromEmail(user.email))
        : 'Guest User';
    const email = user?.email ?? 'not signed in';

    const activeMode = MODES.find(mode => mode.value === theme) ?? MODES[1];
    const ActiveModeIcon = activeMode.icon;

    const handleLogout = () => {
        logout.mutate(undefined, {
            onSettled: () => navigate('/', { replace: true }),
        });
    };

    return (
        <div className={collapsed ? 'p-1.5' : 'px-2 pt-2 pb-3'}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            type="button"
                            aria-label="Account menu"
                            className={`m-panel w-full cursor-pointer text-left transition-colors hover:border-hairline-strong data-popup-open:border-brand-line ${
                                collapsed
                                    ? 'flex justify-center px-1.5 py-1.5'
                                    : 'm-panel-shine px-3 py-2.5'
                            }`}
                        />
                    }
                >
                    <span className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-medium tracking-wide text-brand ring-1 ring-brand-line">
                            {getInitials(fullName)}
                        </span>
                        {!collapsed && (
                            <span className="grid flex-1 leading-tight">
                                <span className="truncate text-[13px] font-medium text-text-hi capitalize">
                                    {fullName}
                                </span>
                                <span className="truncate text-[11px] text-text-low">{email}</span>
                            </span>
                        )}
                    </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="w-60 min-w-60 border border-hairline bg-surface-2 p-1.5 shadow-lift ring-0"
                >
                    <div className="flex items-center gap-2.5 px-2 pt-1.5 pb-2.5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-medium text-brand ring-1 ring-brand-line">
                            {getInitials(fullName)}
                        </span>
                        <span className="grid flex-1 leading-tight">
                            <span className="truncate text-[13px] font-medium text-text-hi capitalize">
                                {fullName}
                            </span>
                            <span className="truncate text-[11px] text-text-low">{email}</span>
                        </span>
                    </div>

                    <div className="my-1 h-px bg-hairline" />

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2.5 rounded-md px-2 py-2 text-[13px] text-text-hi focus:bg-surface-3 data-popup-open:bg-surface-3">
                            <ActiveModeIcon className="size-4 text-text-mid" />
                            <span className="flex-1">Theme</span>
                            <span className="text-[11px] text-text-low">{activeMode.label}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-52 min-w-52 border border-hairline bg-surface-2 p-1.5 shadow-lift ring-0">
                            {MODES.map(mode => {
                                const Icon = mode.icon;

                                return (
                                    <DropdownMenuItem
                                        key={mode.value}
                                        onClick={() => setTheme(mode.value)}
                                        className="gap-2.5 rounded-md px-2 py-2 focus:bg-surface-3"
                                    >
                                        <Icon className="size-4 text-text-mid" />
                                        <span className="grid flex-1 leading-tight">
                                            <span className="text-[13px] text-text-hi">
                                                {mode.label}
                                            </span>
                                            <span className="text-[11px] text-text-low">
                                                {mode.hint}
                                            </span>
                                        </span>
                                        {theme === mode.value && (
                                            <Check className="size-3.5 text-brand" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="gap-2.5 rounded-md px-2 py-2 text-[13px] text-text-hi focus:bg-surface-3"
                    >
                        <UserCircle className="size-4 text-text-mid" />
                        Profile
                    </DropdownMenuItem>

                    <div className="my-1 h-px bg-hairline" />

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="gap-2.5 rounded-md px-2 py-2 text-[13px] text-overdue focus:bg-overdue-soft"
                    >
                        <LogOut className="size-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
