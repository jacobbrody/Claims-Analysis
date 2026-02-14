import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryShare } from '../../types';

interface Props {
  data: CategoryShare[];
}

export default function CategoryChart({ data }: Props) {
  return (
    <div className="flex items-center gap-6">
      <div className="w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="spend"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, _name: string, props: { payload?: CategoryShare }) => [
                `${value}% of spend · ${props.payload?.claims ?? 0}% of claims`,
                props.payload?.name ?? '',
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 text-sm">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-gray-700">{cat.name}</span>
            <span className="text-gray-400 ml-auto tabular-nums">{cat.spend}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
