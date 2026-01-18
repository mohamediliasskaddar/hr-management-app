#!/bin/bash

echo "🚀 Creating HR Management Backend structure..."

# Root folders
mkdir -p src
mkdir -p archive

# # SRC subfolders
# mkdir -p src/config
# mkdir -p src/models
# mkdir -p src/services
# mkdir -p src/controllers
# mkdir -p src/routes
# mkdir -p src/middlewares

# # Config files
# touch src/config/db.js
# # touch src/config/multer.js
# touch src/config/swagger.js

# Model files
# touch src/models/user.model.js
# touch src/models/employee.model.js
# touch src/models/position.model.js
# touch src/models/leaveRequest.model.js
# touch src/models/absences.model.js
# touch src/models/attendance.model.js
# touch src/models/announcement.model.js
# touch src/models/notification.model.js
# touch src/models/auditLogs.model.js

# Service files
# touch src/services/auths.service.js
# touch src/services/users.service.js
# touch src/services/employees.service.js
# touch src/services/leaves.service.js
# touch src/services/attendances.service.js
# touch src/services/announcements.service.js
# touch src/services/notifications.service.js
# touch src/services/auditLogs.service.js
touch src/services/absences.service.js

# Controller files
# touch src/controllers/auth.controller.js
# touch src/controllers/users.controller.js
# touch src/controllers/employees.controller.js
# touch src/controllers/leaves.controller.js
# touch src/controllers/attendances.controller.js
# touch src/controllers/announcements.controller.js
# touch src/controllers/notifications.controller.js
touch src/controllers/auditLogs.controller.js
touch src/controllers/absences.controller.js

# Route files
# touch src/routes/auth.routes.js
# touch src/routes/users.routes.js
# touch src/routes/employees.routes.js
# touch src/routes/leaves.routes.js
# touch src/routes/attendances.routes.js
# touch src/routes/announcements.routes.js
# touch src/routes/notifications.routes.js
touch src/routes/auditLogs.routes.js
touch src/routes/absences.routes.js
# touch src/routes/index.js

# Middleware files
# touch src/middlewares/auth.middleware.js
# touch src/middlewares/role.middleware.js
# touch src/middlewares/error.middleware.js
# touch src/middlewares/audit.middleware.js

# Core app files
# touch src/app.js
# touch src/server.js

echo "✅ Structure created successfully!"
