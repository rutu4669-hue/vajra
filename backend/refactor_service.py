with open("backend/services/domain_analysis_service.py", "r") as f:
    content = f.read()

no_real_data_str = """            # If we couldn't get real data, use mock data
            if not real_data:
                return self._get_mock_data(target)"""
content = content.replace(no_real_data_str, "")

with open("backend/services/domain_analysis_service.py", "w") as f:
    f.write(content)
