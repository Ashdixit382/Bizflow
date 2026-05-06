import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import KpiCard from "./KpiCard";

const STORAGE_KEY = "bizflow_kpi_order";

const defaultOrder = ["revenue", "orders", "customers", "inventory"];

function SortableKpi({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        type="button"
        className="absolute right-2 top-2 rounded-md p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-500/10 hover:text-indigo-500 focus:opacity-100"
        aria-label="Drag to reorder KPI"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      {children}
    </div>
  );
}

export default function DraggableKpiGrid({ kpis }) {
  const [order, setOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length) return saved.filter((id) => id in kpis);
    } catch {
      /* ignore */
    }
    return defaultOrder.filter((id) => id in kpis);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const orderedEntries = useMemo(() => order.map((id) => [id, kpis[id]]).filter(([, v]) => v != null), [order, kpis]);

  function handleDragEnd(ev) {
    const { active, over } = ev;
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  const ids = orderedEntries.map(([id]) => id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {orderedEntries.map(([id, spec]) => (
            <SortableKpi key={id} id={id}>
              <KpiCard title={spec.title} value={spec.value} />
            </SortableKpi>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
