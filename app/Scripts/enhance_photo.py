#!/usr/bin/env python3
"""
enhance_photo.py
CLI de mejora de fotografías con IA local (100% offline, sin depender de APIs externas).
"""

import sys
import json
from ai_engine import enhance_file

def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            "success": False,
            "error": "Uso: python enhance_photo.py <input_path> <output_path>"
        }))
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    res = enhance_file(input_path, output_path)
    print(json.dumps(res, ensure_ascii=False))

    if not res.get("success"):
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()
