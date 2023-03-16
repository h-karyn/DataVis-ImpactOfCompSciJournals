library(tidyr)
library(dplyr)

cleanData <- read_csv("data/cleanData.csv")
df_long <- cleanData %>% 
  pivot_longer(cols = c(Category1 ,Category2, Category3, Category4), names_to = "category", values_to = "Subfield", values_drop_na = TRUE)

df_long_dup <- df_long %>% select(-category)

write_csv(df_long_dup,'data/data.csv')


df <- df_long_dup
range(df$`2021 JIF`)
range(df$`% of OA Gold`)
length(unique(df$Subfield))
range(as.numeric(df$`Total Articles`),na.rm =TRUE)

