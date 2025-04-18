#!/usr/bin/env node

import { writeRedirectsFile } from '../migration/index.mjs';

// Execute the function to generate _redirects file
writeRedirectsFile();
