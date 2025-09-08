'use client';

interface PermissionsTabProps {
  userId: number;
}

export default function PermissionsTab({ userId }: PermissionsTabProps) {
  // Mock permission categories and their permissions
  const permissionCategories = [
    { 
      name: 'Events', 
      permissions: [
        { id: 1, name: 'View Events', granted: true },
        { id: 2, name: 'Create Events', granted: true },
        { id: 3, name: 'Edit Events', granted: true },
        { id: 4, name: 'Delete Events', granted: false },
      ]
    },
    {
      name: 'Users',
      permissions: [
        { id: 5, name: 'View Users', granted: true },
        { id: 6, name: 'Create Users', granted: false },
        { id: 7, name: 'Edit Users', granted: false },
        { id: 8, name: 'Delete Users', granted: false },
      ]
    },
    {
      name: 'Rewards',
      permissions: [
        { id: 9, name: 'View Rewards', granted: true },
        { id: 10, name: 'Create Rewards', granted: true },
        { id: 11, name: 'Edit Rewards', granted: true },
        { id: 12, name: 'Delete Rewards', granted: false },
      ]
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Permissions</h2>
      
      <div className="space-y-6">
        {permissionCategories.map((category) => (
          <div key={category.name} className="bg-[#2d2d2d] p-4 rounded-md">
            <h3 className="text-md font-semibold mb-3 text-[#007acc]">{category.name}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-2 bg-[#252526] rounded">
                  <span>{permission.name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    permission.granted ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
                  }`}>
                    {permission.granted ? 'Granted' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
