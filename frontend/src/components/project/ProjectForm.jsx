import { useForm } from 'react-hook-form';
import Button from '../common/Button';

export default function ProjectForm({ initialValues, teams, onSubmit, onCancel, submitLabel = 'Create project' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: initialValues || { name: '', description: '', teamId: '', milestoneDueDate: '', status: 'ACTIVE' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1" htmlFor="name">Project name</label>
        <input
          id="name"
          className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
          {...register('name', { required: 'Project name is required', maxLength: { value: 150, message: 'Max 150 characters' } })}
        />
        {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1" htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1" htmlFor="teamId">Team</label>
          <select
            id="teamId"
            className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
            {...register('teamId')}
          >
            <option value="">No team</option>
            {teams?.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1" htmlFor="milestoneDueDate">Milestone due date</label>
          <input
            id="milestoneDueDate"
            type="date"
            className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
            {...register('milestoneDueDate')}
          />
        </div>
      </div>

      {initialValues && (
        <div>
          <label className="block text-sm text-slate-300 mb-1" htmlFor="status">Status</label>
          <select
            id="status"
            className="w-full bg-ink border border-panelBorder rounded-md px-3 py-2 text-sm text-slate-100"
            {...register('status')}
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
