export function getManagedRequestActions(role, status) {
  const actions = ['view']
  if (role === 'admin') actions.push('edit', 'delete')
  if (status === 'inprogress') actions.push('done')
  if (status === 'pending' || status === 'inprogress') actions.push('canceled')
  if (status === 'inprogress') actions.push('cancelAssignment')
  return actions
}

export function getUserManagementActions(user) {
  const actions = [user.status === 'active' ? 'blocked' : 'active']
  if (user.role === 'donor') actions.push('volunteer')
  if (user.role !== 'admin') actions.push('admin')
  return actions
}
