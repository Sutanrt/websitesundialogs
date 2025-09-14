'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { entitlementsByUserType } from '@/lib/ai/entitlements';

// tipe ringan agar tidak bergantung next-auth saat dev
type SimpleSession = { user?: { type?: string } } | null;

interface Props extends React.ComponentProps<typeof Button> {
  session?: SimpleSession;
  selectedModelId: string;
  className?: string;
}

export function ModelSelector({
  session,
  selectedModelId,
  className,
  ...btnProps
}: Props) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);

  // ===== INI BAGIAN userType / allowedIds / availableChatModels =====
  const userType = (session?.user?.type ?? 'free') as string;

  const ent: any = entitlementsByUserType ?? {};
  const defaultIds = chatModels.map((m) => m.id);
  const freeIds = Array.isArray(ent['free']?.availableChatModelIds)
    ? ent['free'].availableChatModelIds
    : defaultIds;

  const allowedIds = Array.isArray(ent[userType]?.availableChatModelIds)
    ? ent[userType].availableChatModelIds
    : freeIds;

  const availableChatModels = useMemo(
    () => chatModels.filter((m) => allowedIds.includes(m.id)),
    [allowedIds]
  );
  // ==================================================================

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find((m) => m.id === optimisticModelId) ??
      availableChatModels[0] ??
      chatModels[0],
    [optimisticModelId, availableChatModels]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
          {...btnProps}
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableChatModels.map((chatModel) => {
          const { id } = chatModel;
          const active = id === optimisticModelId;

          return (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => {
                setOpen(false);
                startTransition(() => {
                  setOptimisticModelId(id);
                  saveChatModelAsCookie(id);
                });
              }}
              data-active={active}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{chatModel.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {chatModel.description}
                  </div>
                </div>
                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
