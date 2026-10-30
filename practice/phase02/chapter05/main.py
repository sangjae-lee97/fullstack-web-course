from db import fetch_members

# PostgreSQL에서 회원 데이터 조회
columns, members = fetch_members()

# 실제 컬럼 구조 출력
print("=== 실제 컬럼 구조 ===")
print(columns)

# 회원 목록 출력
print("\n=== 회원 목록 ===")
for member in members:
    print(member)

# 조회된 회원 수
print(f"\n조회된 회원 수: {len(members)}")