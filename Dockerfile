# Menggunakan base image Node.js versi 20 dengan Alpine
FROM node:20-alpine

# Menentukan working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi ke dalam container
COPY . .

# Set environment ke production
ENV NODE_ENV=production

# Expose port yang digunakan aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["node", "server.js"]
