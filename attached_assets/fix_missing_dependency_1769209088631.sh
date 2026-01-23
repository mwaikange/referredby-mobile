#!/bin/bash

# Fix: Install missing @react-native-picker/picker dependency

cd mobile

# Install the missing package
npm install @react-native-picker/picker

# Also check if there are other missing dependencies
echo "Checking for other potential missing imports..."

# Update package.json version to 1.0.9
