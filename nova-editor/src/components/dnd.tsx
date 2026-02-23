import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '../lib/utils';

export const DraggableItem = ({ id, data, children, className }: { id: string, data: any, children: React.ReactNode, className?: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn(className, isDragging && "opacity-50")}>
      {children}
    </div>
  );
};

export const DroppableFolder = ({ id, data, children, className }: { id: string, data: any, children: React.ReactNode, className?: string }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });
  
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "bg-[var(--accent-soft)] ring-1 ring-[var(--accent-color)] rounded-lg")}>
      {children}
    </div>
  );
};