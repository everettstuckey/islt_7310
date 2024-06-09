
import pandas as pd
from datetime import datetime
import re
from fuzzywuzzy import fuzz, process

# Function to clean and format dates
def clean_date(date_str):
    # List of month names
    months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    
    # Regular expression to capture the month, day, and year
    date_pattern = re.compile(r'([A-Za-z]+)\s?(\d{1,2}),?\s?(\d{4})')
    
    # Find matches using regex
    match = date_pattern.match(date_str)
    if match:
        month, day, year = match.groups()
        # Ensure proper formatting
        cleaned_date_str = f"{month} {int(day):02d}, {year}"
        return cleaned_date_str
    else:
        # Attempt fuzzy matching for months if regex fails
        best_match, score = process.extractOne(date_str, months)
        if score > 80:
            # Reconstruct date string with best match
            return best_match
        return date_str

def process_scholarships_data():
    # Use combined_df from previous steps
    combined_df = pd.read_csv("processed_scholarships_data.csv", delimiter=",", encoding="utf-8", low_memory=False)

    # Ensure the columns are of type text
    combined_df = combined_df.astype({"Scholarship Title": str, "Amount": str, "Due Date": str})

    # Apply the cleaning function to the "Due Date" column
    combined_df["Due Date"] = combined_df["Due Date"].apply(clean_date)

    # Convert Due Date to datetime
    combined_df["Due Date"] = pd.to_datetime(combined_df["Due Date"], format="%B %d, %Y", errors='coerce')

    # Drop rows where "Due Date" is NaT (null)
    combined_df = combined_df.dropna(subset=["Due Date"])

    # Add Custom column
    current_date = datetime.now().date()
    combined_df["Days til due"] = combined_df["Due Date"].apply(lambda x: (x.date() - current_date).days if pd.notnull(x) and (x.date() - current_date).days > 0 else 0)

    # Reformat the Due Date to month-day-year
    combined_df["Due Date"] = combined_df["Due Date"].dt.strftime("%m-%d-%Y")

    # Reorder columns
    combined_df = combined_df[["Days til due", "Amount", "Scholarship Title", "Due Date"]]

    # Sort rows by "Days til due"
    combined_df = combined_df.sort_values(by "Days til due")

    # Reset index
    combined_df = combined_df.reset_index(drop=True)

    # Save the updated CSV file
    combined_df.to_csv("processed_scholarships_data.csv", index=False)

    # Convert DataFrame to HTML and save to file
    html_table = combined_df.to_html(index=False)
    with open("scholarships_data.html", "w") as f:
        f.write(html_table)

    return combined_df

if __name__ == "__main__":
    processed_df = process_scholarships_data()
    print("Processed data has been updated and saved to scholarships_data.html")
