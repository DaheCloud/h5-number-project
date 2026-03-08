import json
import os
import re

def parse_markdown_to_json(md_content):
    data = {}
    current_category = None
    lines = md_content.splitlines()
    
    main_categories = ["生肖", "五行", "波色", "五门", "段位", "合数", "合单双", "其它属性"]

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        if line in main_categories:
            current_category = line
            data[current_category] = {} # Use dictionary for all categories for optimized structure
            i += 1
            continue

        if current_category:
            if current_category == "其它属性":
                parts = re.split(r'[\t、]', line, 1)
                if len(parts) >= 2:
                    key = parts[0].strip()
                    values_str = parts[1].strip()
                    values = [v.strip() for v in re.split(r'[、]', values_str) if v.strip()]
                    data[current_category][key] = values
            else:
                # Handle categories with number lists
                parts = line.split('\t', 1)
                if len(parts) >= 1:
                    sub_name = parts[0].strip()
                    numbers = []
                    if len(parts) == 2:
                        # Convert to integers for type optimization
                        numbers.extend([int(num.strip()) for num in parts[1].split(' ') if num.strip()])
                    
                    # Look ahead for numbers on subsequent lines
                    j = i + 1
                    while j < len(lines) and re.match(r'^(\d+\s*)+$', lines[j].strip()):
                        numbers.extend([int(num.strip()) for num in lines[j].strip().split(' ') if num.strip()])
                        j += 1
                    
                    data[current_category][sub_name] = numbers
                    i = j - 1
        i += 1
    return data

def main():
    md_file_path = r'f:\pnpm-monorepo-project\packages\project-h5\src\data\data.md'
    json_file_path = r'f:\pnpm-monorepo-project\packages\project-h5\src\data\data.json'

    try:
        with open(md_file_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"错误: Markdown文件未找到于 {md_file_path}")
        return
    except Exception as e:
        print(f"读取Markdown文件时发生错误: {e}")
        return

    parsed_data = parse_markdown_to_json(md_content)

    try:
        # Validate JSON structure (RFC 8259 compliance is handled by json.dumps)
        json_output = json.dumps(parsed_data, ensure_ascii=False, indent=2)
        
        # Basic validation by trying to load it back
        json.loads(json_output)

        with open(json_file_path, 'w', encoding='utf-8') as f:
            f.write(json_output)
        
        print("转换成功")

        # Get file size
        file_size = os.path.getsize(json_file_path)

        # Get object count (assuming top-level is an object)
        object_count = len(parsed_data)

        # Get top-level keys
        top_level_keys = list(parsed_data.keys())

        print(f"文件大小: {file_size} 字节")
        print(f"对象数量: {object_count}")
        print(f"顶层键名列表: {top_level_keys}")

    except json.JSONDecodeError as e:
        print(f"错误: 生成的JSON不符合RFC 8259规范或存在语法错误: {e}")
    except Exception as e:
        print(f"写入JSON文件时发生错误: {e}")

if __name__ == "__main__":
    main()
