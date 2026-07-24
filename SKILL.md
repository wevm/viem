---
name: viem
description: Use this skill when building, fixing, reviewing, or migrating TypeScript code with Viem. Use the Viem MCP server to look up current documentation and source code.
---

# Viem

Use the read-only Viem MCP server at `https://viem.sh/api/mcp`. It uses Streamable HTTP and
requires no authentication.

## Usage

1. Search documentation with `search_docs`, then read relevant pages with `read_page`.
2. Search implementation details with `search_source`, then inspect relevant files with
   `read_source_file`.
3. Use `list_pages`, `list_sources`, `list_source_files`, or `get_file_tree` only when search
   cannot locate the relevant material.
4. Confirm the public import, signature, types, and generics before changing code.
